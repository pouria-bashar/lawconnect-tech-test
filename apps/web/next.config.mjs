/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  serverExternalPackages: ["@mastra/*", "@react-pdf/renderer", "@json-render/react-pdf"],
}

export default nextConfig
