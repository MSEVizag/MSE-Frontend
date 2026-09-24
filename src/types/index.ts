export interface ProductFeature {
  icon: string;
  title: string;
  desc: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductDocument {
  label: string;
  url: string;
}

export interface PricingTier {
  minQty: number;
  maxQty: number;
  price: number;
}

export interface Testimonial {
  clientName: string;
  reviewText: string;
  rating: number;
  isVerified: boolean;
}


export interface Product {
  id: string;
  title: string;
  category: string;
  image: string;
  thumbnails?: string[];
  description: string;
  features?: ProductFeature[];
  specs?: ProductSpec[];
  extendedSpecs?: ProductSpec[];
  originalUrl?: string;
  tag?: string;
  
  // B2B Enterprise Fields
  videoUrl?: string;
  badges?: string[];
  moq?: number;
  stockStatus?: string;
  pricingTiers?: PricingTier[];
  hideExactPrices?: boolean;
  testimonials?: Testimonial[];
}
