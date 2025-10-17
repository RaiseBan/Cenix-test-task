export interface ProductData {
    price?: string;
    priceOld?: string;
    rating?: string;
    reviewCount?: string;
}

export interface ApiProduct {
    productId: number;
    url: string;
    name: string;
    rating?: number;
    reviews?: number;
    price?: number;
    oldPrice?: number;
    discount?: number;
    discountPercent?: number;
}