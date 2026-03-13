import Cloudflare from "cloudflare";

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_DISPATCH_NAMESPACE = process.env.CF_DISPATCH_NAMESPACE;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function hashContent(content: string): Promise<{ hash: string; size: number }> {
  const encoded = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // First 16 bytes (32 hex chars) per Cloudflare API requirement
  const hash = hashArray
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { hash, size: encoded.byteLength };
}

export interface DeployResult {
  url: string;
  scriptName: string;
}

export async function deployWorkerWithAssets(
  html: string,
  scriptName?: string,
): Promise<DeployResult> {
  const apiToken = requireEnv("CF_API_TOKEN", CF_API_TOKEN);
  const accountId = requireEnv("CF_ACCOUNT_ID", CF_ACCOUNT_ID);
  const namespace = requireEnv("CF_DISPATCH_NAMESPACE", CF_DISPATCH_NAMESPACE);

  const name = scriptName ?? `genui-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  const client = new Cloudflare({ apiToken });

  // Step 1: Build manifest
  const { hash, size } = await hashContent(html);
  const manifest = { "/index.html": { hash, size } };
  const base64Content = btoa(
    Array.from(new TextEncoder().encode(html), (b) => String.fromCodePoint(b)).join(""),
  );

  // Step 2: Create upload session via SDK
  const session = await client.workersForPlatforms.dispatch.namespaces.scripts.assetUpload.create(
    namespace,
    name,
    {
      account_id: accountId,
      manifest,
    },
  );

  if (!session.jwt) {
    throw new Error("Asset upload session did not return a JWT");
  }

  // Step 3: Upload assets in buckets
  let completionToken = session.jwt;
  const buckets = session.buckets;
  const cfBase = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers`;

  if (buckets && buckets.length > 0) {
    for (const bucket of buckets) {
      const formData = new FormData();
      for (const bucketHash of bucket) {
        if (bucketHash === hash) {
          formData.set(
            bucketHash,
            new File([base64Content], bucketHash, { type: "application/octet-stream" }),
          );
        }
      }

      const uploadRes = await fetch(`${cfBase}/assets/upload?base64=true`, {
        method: "POST",
        headers: { Authorization: `Bearer ${completionToken}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        throw new Error(`Asset upload failed (${uploadRes.status}): ${err}`);
      }

      const uploadData = (await uploadRes.json()) as { result: { jwt: string } };
      completionToken = uploadData.result.jwt;
    }
  }

  // Step 4: Deploy worker with assets binding (raw fetch to match CF API expectations)
  const workerCode = `
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};`

  const deployFormData = new FormData();
  const metadata = {
    main_module: "worker.mjs",
    compatibility_date: "2025-01-24",
    assets: { jwt: completionToken },
    bindings: [{ type: "assets", name: "ASSETS" }],
  };

  deployFormData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );
  deployFormData.append(
    "worker.mjs",
    new File([workerCode], "worker.mjs", { type: "application/javascript+module" }),
  );

  const deployRes = await fetch(
    `${cfBase}/dispatch/namespaces/${namespace}/scripts/${name}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${apiToken}` },
      body: deployFormData,
    },
  );

  if (!deployRes.ok) {
    const err = await deployRes.text();
    throw new Error(`Worker deploy failed (${deployRes.status}): ${err}`);
  }

  return {
    url: `https://test-dispatcher.pouriab.workers.dev/${name}`,
    scriptName: name,
  };
}
