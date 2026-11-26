'use client'

import { API_URL, getListingPhotoUrl } from '@/lib/api-url'

import { Button } from '@/components/ui/button'
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { EditListingSchema, FieldErrors, ParseZodErrors } from '@/lib/schemas'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import z from 'zod'

interface ApiListing {
	id: string
	sellerId: string
	city: string
	description: string
	carImages: string[]
	listingStatus: number
	status: number | null
	car: {
		id: string
		brand: string
		model: string
		year: number
		price: {
			amount: number
			currency: string
		}
	}
}
type EditListingFields = z.infer<typeof EditListingSchema>

async function getListing(id: string): Promise<ApiListing> {
	const response = await fetch(`${API_URL}/api/listing/${id}`)

	if (!response.ok) throw new Error('Failed to load listing')

	return response.json()
}

export default function EditListingForm({ listingId }: { listingId: string }) {
	const router = useRouter()
	const token = useAuthStore(x => x.token)

	const [listing, setListing] = useState<ApiListing | null>(null)
	const [city, setCity] = useState('')
	const [description, setDescription] = useState('')
	const [existingImages, setExistingImages] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const [errors, setErrors] = useState<FieldErrors<EditListingFields>>({})

	useEffect(() => {
		async function loadListing() {
			try {
				const data = await getListing(listingId)

				setListing(data)
				setCity(data.city)
				setDescription(data.description)
				setExistingImages(data.carImages ?? [])
			} catch {
				setError('Failed to load listing')
			} finally {
				setLoading(false)
			}
		}

		loadListing()
	}, [listingId])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		const result = EditListingSchema.safeParse({
			city,
			description
		})
		if (!result.success) {
			setErrors(ParseZodErrors<EditListingFields>(result.error))
			return
		}

		setErrors({})

		if (!token) {
			setError('You must be logged in')
			return
		}

		try {
			const response = await fetch(
				`${API_URL}/api/listing/${listingId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({
						city,
						description
					})
				}
			)

			if (!response.ok) throw new Error('Failed to update listing')

			router.push('/seller/dashboard')
		} catch {
			setError('Failed to update listing')
		}
	}

	if (loading) return <p className='px-6 py-20'>Loading listing...</p>
	if (error) return <p className='px-6 py-20 text-destructive'>{error}</p>
	if (!listing) return <p className='px-6 py-20'>Listing not found</p>

	return (
		<section className='px-6 py-16 md:px-12 md:py-24'>
			<div className='mx-auto max-w-2xl border border-border bg-card p-8 md:p-12 shadow-sm'>
				{errors.city && <p className='mb-4 text-sm text-destructive'>{errors.city}</p>}
				{errors.description && <p className='mb-4 text-sm text-destructive'>{errors.description}</p>}
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<div className='text-center'>
							<h1 className='text-2xl font-bold uppercase tracking-tight'>Edit Listing</h1>
							<FieldDescription>
								Update listing details and review uploaded photos.
							</FieldDescription>
						</div>

						<Field>
							<FieldLabel>Brand</FieldLabel>
							<Input value={listing.car.brand} disabled />
						</Field>

						<Field>
							<FieldLabel>Model</FieldLabel>
							<Input value={listing.car.model} disabled />
						</Field>

						<Field>
							<FieldLabel>Year</FieldLabel>
							<Input value={listing.car.year} disabled />
						</Field>

						<Field>
							<FieldLabel>Price</FieldLabel>
							<Input
								value={`${listing.car.price.amount} ${listing.car.price.currency}`}
								disabled
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor='city'>City</FieldLabel>
							<Input
								id='city'
								value={city}
								onChange={e => setCity(e.target.value)}
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor='description'>Description</FieldLabel>
							<textarea
								id='description'
								className='min-h-32 w-full border border-input bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'
								value={description}
								onChange={e => setDescription(e.target.value)}
								required
							/>
						</Field>

						<Field className='gap-4'>
							<FieldLabel>Existing Photos</FieldLabel>

							{existingImages.length === 0 ? (
								<p className='text-sm text-muted-foreground'>No photos yet</p>
							) : (
								<div className='grid grid-cols-3 gap-4'>
									{existingImages.map(image => (
										<div key={image} className='relative'>
											<img
												src={getListingPhotoUrl(image)}
												alt='Car photo'
												className='h-32 w-full object-cover'
											/>

										</div>
									))}
								</div>
							)}
						</Field>


						<Field>
							<Button type='submit' size='lg' className='w-full'>Save Changes</Button>
						</Field>
					</FieldGroup>
				</form>
			</div>
		</section>
	)
}
