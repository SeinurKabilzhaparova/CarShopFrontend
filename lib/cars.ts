export interface Car {
  id: string
  name: string
  brand: string
  year: number
  price: number
  currency?: string
  
  image?: string
  featured?: boolean

  sellerId: string
  mileage?: string
  transmission?: string
  fuelType?: string
}


export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat("en-US").format(mileage) + " mi"
}
