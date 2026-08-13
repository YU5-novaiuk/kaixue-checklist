import type { NextConfig } from 'next'

// GitHub project pages are served from /<repository-name>.  Keep the normal
// build at / so local development and the existing deployment are unaffected.
const pagesBasePath = process.env.PAGES_BASE_PATH ?? ''
const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true'
const isDevelopment = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep local development artifacts separate from production/static builds.
  // This prevents a running localhost server from loading incompatible chunks
  // when a production build is created in the same project.
  distDir: isDevelopment ? '.next-dev' : '.next',
  output: 'export',
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath || undefined,
  trailingSlash: isGitHubPagesBuild,
}
export default nextConfig
