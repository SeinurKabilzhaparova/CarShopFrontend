export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107').replace(/\/+$/, '')

export function getListingPhotoUrl(photo: string): string {
	if (/^https?:\/\//i.test(photo)) return photo
	return `${API_URL}/uploads/${encodeURIComponent(photo.replace(/^\/?uploads\//, ''))}`
}
