/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  images: {
    domains: ["cdn.sanity.io"],
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
}

export default nextConfig;