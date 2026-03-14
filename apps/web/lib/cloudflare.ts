import Cloudflare from "cloudflare";

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_DISPATCH_NAMESPACE = process.env.CF_DISPATCH_NAMESPACE;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
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
  const moduleFileName = `${name}.mjs`;

  const cf = new Cloudflare({ apiToken });

  // Generate worker code that embeds the HTML and serves it directly
  const workerCode = `const HTML = ${JSON.stringify(html)};
export default {
  async fetch(request, env) {
    return new Response(HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
};`;

  // Deploy using the SDK
  await cf.workersForPlatforms.dispatch.namespaces.scripts.update(
    namespace,
    name,
    {
      account_id: accountId,
      metadata: {
        main_module: moduleFileName,
      },
      files: [
        new File([workerCode], moduleFileName, {
          type: "application/javascript+module",
        }),
      ],
    },
  );

  return {
    url: `https://ui.pouriab.workers.dev/${name}`,
    scriptName: name,
  };
}
