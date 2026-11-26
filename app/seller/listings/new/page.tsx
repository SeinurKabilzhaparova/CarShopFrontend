'use client'

import { Button } from '@/components/ui/button'
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel
} from '@/components/ui/field'
import { API_URL } from '@/lib/api-url'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export interface Car {
	id: string
	name: string
	brand: string
	year: number
	price: number
	image?: string
	featured?: boolean
}

export default function CreateNewListing() {
	const [carBrand, setCarBrand] = useState('')
	const [carModel, setCarModel] = useState('')
	const [carYear, setCarYear] = useState('')
	const [carVin, setCarVin] = useState('')
	const [currency, setCurrency] = useState('')
	const [carPrice, setCarPrice] = useState('')
	const [carCity, setCarCity] = useState('')
	const [carDescription, setCarDescription] = useState('')

	const router = useRouter()
	const token = useAuthStore(x => x.token)

	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const [images, setImages] = useState<File[]>([])
	const [previews, setPreviews] = useState<string[]>([])

	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? [])
		setImages(prev => [...prev, ...files])

		const previewUrls = files.map(file => URL.createObjectURL(file))

		setPreviews(prev => [...prev, ...previewUrls])
	}
	function removeImage(index: number) {
		setImages(prev => prev.filter((_, i) => i !== index))
		setPreviews(prev => prev.filter((_, i) => i !== index))
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')

		if (!token) {
			setError('You must be logged in')
			return
		}
		try {
			setLoading(true)

			const sellerResponse = await fetch(`${API_URL}/seller/me`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			if (sellerResponse.status === 404) {
				router.push('/seller/dashboard')
				return
			}
			if (!sellerResponse.ok) throw new Error('Could not verify your seller profile')

			const carResponse = await fetch(`${API_URL}/api/cars`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					brand: carBrand,
					model: carModel,
					year: Number(carYear),
					price: Number(carPrice),
					vin: carVin.trim().toUpperCase(),
					currency: currency.trim().toUpperCase()
				})
			})
			if (!carResponse.ok) {
				throw new Error('Failed to create car')
			}
			const carId = (await carResponse.json()) as string

			const formData = new FormData()
			formData.append('carId', carId)
			formData.append('city', carCity)
			formData.append('description', carDescription)

			images.forEach(image => {
				formData.append('photos', image)
			})

			const listingResponse = await fetch(`${API_URL}/api/listing`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				},
				body: formData
			})

			if (!listingResponse.ok) throw new Error('Failed to create listing')

			router.push('/seller/dashboard')
		} catch (error) {
			console.log(error)
			setError(error instanceof Error ? error.message : 'Something went wrong')
		} finally {
			setLoading(false)
		}
	}
	return (
		<section className='px-6 py-16 md:px-12 md:py-24'>
			<div className='mx-auto max-w-2xl border border-border bg-card p-8 shadow-sm md:p-12'>
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<div className='flex flex-col items-center gap-2 text-center'>
							<h1 className='text-2xl font-bold uppercase tracking-tight'>Create New Listing</h1>
							<FieldDescription>
								Add car details, listing information and vehicle photos
							</FieldDescription>
						</div>
						<div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
							<Field>
								<FieldLabel htmlFor='carBrand'>Car Brand</FieldLabel>
								<Input
									id='carBrand'
									type='text'
									placeholder='BMW'
									value={carBrand}
									onChange={e => setCarBrand(e.target.value)}
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor='carModel'>Model</FieldLabel>
								<Input
									id='carModel'
									type='text'
									placeholder='X5'
									value={carModel}
									onChange={e => setCarModel(e.target.value)}
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor='carYear'>Year</FieldLabel>
								<Input
									id='carYear'
									type='number'
									placeholder='2005'
									value={carYear}
									onChange={e => setCarYear(e.target.value)}
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor='carVin'>VIN</FieldLabel>
								<Input id='carVin' minLength={17} maxLength={17} value={carVin} onChange={e => setCarVin(e.target.value)} required />
							</Field>
							<Field>
								<FieldLabel htmlFor='currency'>Currency code</FieldLabel>
								<Input id='currency' placeholder='EUR' pattern='[A-Za-z]{3}' maxLength={3} value={currency} onChange={e => setCurrency(e.target.value)} required />
							</Field>
							<Field>
								<FieldLabel htmlFor='carPrice'>Price</FieldLabel>
								<Input
									id='carPrice'
									type='number'
									placeholder='75000'
									value={carPrice}
									onChange={e => setCarPrice(e.target.value)}
									required
								/>
							</Field>
						</div>

						<Field>
							<FieldLabel htmlFor='carCity'>City</FieldLabel>
							<Input
								id='carCity'
								type='text'
								placeholder='Prague'
								value={carCity}
								onChange={e => setCarCity(e.target.value)}
								required
							/>
						</Field>
							<Field>
								<FieldLabel htmlFor='description'>Description</FieldLabel>
								<textarea
								id='description'
								placeholder='Describe the car condition, equipment and details...'
								value={carDescription}
								onChange={e => setCarDescription(e.target.value)}
								required
								className='min-h-32 w-full border border-input bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'
							/>
						</Field>
						<Field className='gap-4'>
							<FieldLabel>Car Photos</FieldLabel>
							<input
								type='file'
								ref={fileInputRef}
								accept='image/*'
								multiple
								hidden
								onChange={handleImagesChange}
							/>

							<Button
								type='button'
								variant='outline'
								onClick={() => fileInputRef.current?.click()}
							>
								Upload Photos
							</Button>
							{previews.length > 0 && (
								<div className='mt-4 grid grid-cols-3 gap-4'>
									{previews.map((preview, index) => (
										<div key={preview} className='relative'>
											<img
												src={preview}
												alt='Car preview'
												className='h-32 w-full object-cover'
											/>
											<Button
												type='button'
												variant='destructive'
												size='sm'
												className='absolute right-2 top-2'
												onClick={() => removeImage(index)}
											>
												Delete
											</Button>
										</div>
									))}
								</div>
							)}
						</Field>
						{error && <p className='text-sm text-destructive'>{error}</p>}

						<Field>
							<Button type='submit' disabled={loading} size='lg' className='w-full'>
								{loading ? 'Creating...' : 'Create Listing'}
							</Button>
						</Field>
					</FieldGroup>
				</form>
			</div>
		</section>
	)
}
