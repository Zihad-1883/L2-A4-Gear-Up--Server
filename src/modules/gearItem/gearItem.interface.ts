export interface IGearItem {
    name: string;
    description?: string;
    brand: string;
    price: number;
    stock: number;
    categoryId: string;
    photoUrl?: string;
}

export interface IGearItemQuery {
    categoryId?: string;
    search?: string;
    maxPrice?: string | number;
    minPrice?: string | number;
    brand?: string;
    stock?: string | number;
    limit?: string | number;
    page?: string | number;
    sortBy?: string;
    sortOrder?: string;
}
