'use client'

import { API_URL } from '@/lib/api-url'
import type { apiListing } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from './ui/table'
import Link from 'next/link'

export default function SellerListings({ token }: { token: string }) {
	const [listings, setListing] = useState<apiListing[]>([])
	const [loading, setLoading] = useState(true)

	const [error, setError] = useState('')

	useEffect(() => {
		const controller = new AbortController()
		async function getSellerListings() {
			try {
				const response = await fetch(`${API_URL}/api/listing/me`, {
					headers: { Authorization: `Bearer ${token}` },
					signal: controller.signal
				})
				if (!response.ok) throw new Error('Failed to load listings')
				const data: apiListing[] = await response.json()
				if (!controller.signal.aborted) setListing(data)
			} catch {
				if (!controller.signal.aborted) setError('Could not load your listings.')
			} finally {
				if (!controller.signal.aborted) setLoading(false)
			}
		}
		void getSellerListings()
		return () => controller.abort()
	}, [token])

	async function deleteListing(id: string) {
		setError('')
		try {
			const response = await fetch(`${API_URL}/api/listing/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			})
			if (!response.ok) throw new Error('Failed to delete listing')
			setListing(prev => prev.filter(listing => listing.id !== id))
		} catch {
			setError('Could not delete this listing.')
		}
	}

	if (loading) {
		return <p className='px-6 py-12'>Loading listings...</p>
	}

	return (
		<section className='px-6 py-12 md:px-12 md:py-16'>
			<div className='mx-auto max-w-7xl'>
				{error && <p role='alert' className='mb-4 text-destructive'>{error}</p>}
				{!error && listings.length === 0 && <p className='mb-4'>You haven’t listed any vehicles yet.</p>}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Car</TableHead>
							<TableHead>City</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Listing Status</TableHead>
							<TableHead>Moderation Status</TableHead>
							<TableHead className='text-right'>Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{listings.map(listing => (
							<TableRow key={listing.id}>
								<TableCell className='font-medium'>
									{listing.car.brand} {listing.car.model} {listing.car.year}
								</TableCell>
								<TableCell>{listing.city}</TableCell>
								<TableCell>{listing.car.price.amount} {listing.car.price.currency}</TableCell>
								<TableCell>{listing.listingStatus}</TableCell>
								<TableCell>{listing.status ?? 'Pending'}</TableCell>
								<TableCell className='flex justify-end gap-2'>
									<Button size='sm' asChild>
										<Link href={`/seller/listings/${listing.id}/edit`}>Edit</Link>
									</Button>
									<Button
										size='sm'
										variant='destructive'
										type='button'
										onClick={()=> deleteListing(listing.id)}
									>
										Delete
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</section>
	)
}
