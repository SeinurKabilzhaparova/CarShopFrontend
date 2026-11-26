import type { NextConfig } from 'next'
import { API_URL } from './lib/api-url'

const nextConfig: NextConfig = {
	reactCompiler: true,
	images: {
		remotePatterns: [
			new URL('https://images.unsplash.com/**'),
			new URL(`${API_URL}/uploads/**`)
		]
	}
}

export default nextConfig
