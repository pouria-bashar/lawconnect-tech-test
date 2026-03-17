/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/db"],
  serverExternalPackages: ["@mastra/*", "@react-pdf/renderer", "@json-render/react-pdf", "@arizeai/*"],
}

export default nextConfig
