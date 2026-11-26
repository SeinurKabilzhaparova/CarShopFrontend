'use client'

import { API_URL } from '@/lib/api-url'

import { Button } from '@/components/ui/button'
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { CreateSellerFormSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { useForm } from 'react-hook-form'
import z from 'zod'

type CreateSellerData = z.infer<typeof CreateSellerFormSchema>

export default function CreateSellerForm({ token, onCreated }: { token: string; onCreated: () => void }) {
	const [dealership, setDealership] = useState(false)

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting }
	} = useForm<CreateSellerData>({
		resolver: zodResolver(CreateSellerFormSchema)
	})

	async function onSubmit(data: CreateSellerData) {
		if (dealership && !data.address?.trim()) {
			setError('address', { message: 'Enter the dealership address' })
			return
		}

		const payload = dealership
			? {
				companyName: data.companyName,
				companyCity: data.city,
				companyAddress: data.address,
				companyPhoneNumber: data.mobilePhone,
				companyEmail: data.email
			}
			: { name: data.companyName, city: data.city, phone: data.mobilePhone, email: data.email }

		try {
			const response = await fetch(`${API_URL}${dealership ? '/seller' : '/seller/private'}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(payload)
			})
			if (!response.ok && response.status !== 409) throw new Error('Could not create seller profile')
			onCreated()
		} catch {
			setError('root', { message: 'Could not create your seller profile. Please try again.' })
		}
	}
	return (
		<section className='flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-16 md:px-12'>
			<div className='w-full max-w-md border border-border bg-card p-8 md:p-12 shadow-sm'>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<div className='flex flex-col items-center gap-2 text-center'>
							<h1 className='text-2xl font-bold'>Become a Seller</h1>
							<FieldDescription>Create your seller profile to list vehicles</FieldDescription>
						</div>
						<Field>
							<label className='flex items-center gap-2'>
								<input type='checkbox' checked={dealership} onChange={event => setDealership(event.target.checked)} />
								I sell on behalf of a dealership
							</label>
						</Field>
						<Field>
							<FieldLabel htmlFor='companyName'>
								{dealership ? 'Dealership name' : 'Full name'}
							</FieldLabel>
							<Input
								id='companyName'
								type='text'
								placeholder='BMW Salon or John Smith'
								{...register('companyName')}
							/>
							{errors.companyName && <p className='mt-1 text-sm text-destructive'>{errors.companyName.message}</p>}
						</Field>
						<Field>
							<FieldLabel htmlFor='city'>City</FieldLabel>
							<Input
								id='city'
								type='text'
								placeholder='Prague'
								{...register('city')}
							/>
							{errors.city && <p className='mt-1 text-sm text-destructive'>{errors.city.message}</p>}
						</Field>
						{dealership && (
							<Field>
								<FieldLabel htmlFor='companyAddress'>Company Address</FieldLabel>
								<Input
									id='companyAddress'
									type='text'
									placeholder='Dlouha 234'
									{...register('address')}
								/>
								{errors.address && <p className='mt-1 text-sm text-destructive'>{errors.address.message}</p>}
							</Field>
						)}
						<Field>
							<FieldLabel htmlFor='mobilePhone'>Mobile Phone</FieldLabel>
							<Input
								id='mobilePhone'
								type='text'
								placeholder='+420 000-000-000'
								{...register('mobilePhone')}
							/>
							{errors.mobilePhone && <p className='mt-1 text-sm text-destructive'>{errors.mobilePhone.message}</p>}
						</Field>
						<Field>
							<FieldLabel htmlFor='email'>Email</FieldLabel>
							<Input
								id='email'
								type='email'
								placeholder='m@example.com'
								{...register('email')}
							/>
							{errors.email && <p className='mt-1 text-sm text-destructive'>{errors.email.message}</p>}
						</Field>

						<Field>
							{errors.root && <p role='alert' className='text-sm text-destructive'>{errors.root.message}</p>}
							<Button type='submit' disabled={isSubmitting} size='lg' className='w-full'>
								{isSubmitting ? 'Creating...' : 'Create Profile'}
							</Button>
						</Field>
					</FieldGroup>
				</form>
			</div>
		</section>
	)
}
