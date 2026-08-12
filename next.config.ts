import type { NextConfig } from 'next'

// GitHub project pages are served from /<repository-name>.  Keep the normal
// build at / so local development and the existing deployment are unaffected.
const pagesBasePath = process.env.PAGES_BASE_PATH ?? ''
const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath || undefined,
  trailingSlash: isGitHubPagesBuild,
}
export default nextConfig
