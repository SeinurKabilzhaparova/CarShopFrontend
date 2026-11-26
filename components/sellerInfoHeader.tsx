import { Button } from './ui/button'
import Link from 'next/link'

export interface Seller {
	id: string
	companyName: string
	userId: string
	companyCity: string
	companyAddress: string
	companyPhoneNumber: string
	companyEmail: string
	isVerified: boolean
}
export default function SellerInfoHeader({ seller }: { seller: Seller }) {
	return (
		<section className='border-b border-border bg-secondary px-6 py-16 md:px-12 md:py-20'>
			<div className='mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between'>
				<div>
					<p className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground'>
						Seller Dashboard
					</p>
					<h1 className='mt-2 text-3xl font-bold uppercase tracking-tight md:text-4xl'>{seller.companyName}</h1>
					<p className='mt-3 text-sm text-muted-foreground'>
						{[seller.companyCity, seller.companyAddress].filter(Boolean).join(', ')}
					</p>
					<p className='text-sm text-muted-foreground'>
						{seller.companyEmail} · {seller.companyPhoneNumber}
					</p>
				</div>
				<Button size='lg' asChild>
					<Link href='/seller/listings/new'>New Listing</Link>
				</Button>
			</div>
		</section>
	)
}
