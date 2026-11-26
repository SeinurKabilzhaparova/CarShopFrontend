'use client'

import CreateSellerForm from '@/components/createSellerForm'
import SellerInfoHeader from '@/components/sellerInfoHeader'
import SellerListings from '@/components/sellerListings'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/api-url'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Seller } from '@/components/sellerInfoHeader'

export default function SellerDashboard() {
	const token = useAuthStore(state => state.token)

	if (!token) {
		return (
			<section className='mx-auto max-w-xl px-6 py-24'>
				<h1 className='mb-4 text-2xl font-bold'>Sell a car</h1>
				<p className='mb-6'>Sign in or create an account to list a vehicle.</p>
				<Button asChild><Link href='/login'>Sign in</Link></Button>
			</section>
		)
	}

	return <SellerDashboardContent key={token} token={token} />
}

function SellerDashboardContent({ token }: { token: string }) {
	const [profile, setProfile] = useState<Seller | null>()
	const [error, setError] = useState(false)
	const [attempt, setAttempt] = useState(0)

	function reload() {
		setProfile(undefined)
		setError(false)
		setAttempt(value => value + 1)
	}

	useEffect(() => {
		const controller = new AbortController()
		async function loadProfile() {
			try {
				const response = await fetch(`${API_URL}/seller/me`, {
					headers: { Authorization: `Bearer ${token}` },
					signal: controller.signal
				})
				if (response.status === 404) {
					if (!controller.signal.aborted) setProfile(null)
					return
				}
				if (!response.ok) throw new Error('Could not load seller profile')
				const seller: Seller = await response.json()
				if (!controller.signal.aborted) setProfile(seller)
			} catch {
				if (!controller.signal.aborted) setError(true)
			}
		}
		void loadProfile()
		return () => controller.abort()
	}, [token, attempt])

	if (error) return <div className='px-6 py-20'><p role='alert'>Could not load your seller profile.</p><Button onClick={reload}>Try again</Button></div>
	if (profile === undefined) return <p className='px-6 py-20' role='status'>Loading seller profile…</p>
	if (!profile) return <CreateSellerForm token={token} onCreated={reload} />

	return <><SellerInfoHeader seller={profile} /><SellerListings token={token} /></>
}
