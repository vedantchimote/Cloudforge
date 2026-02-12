import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProductCard from './ProductCard';
import * as cartStore from '@/store/cartStore';

// Mock the cart store
vi.mock('@/store/cartStore', () => ({
    useCartStore: vi.fn(),
}));

describe('ProductCard', () => {
    const mockAddItem = vi.fn();
    const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 999,
        imageUrl: '/test-image.jpg',
        rating: 4.5,
        reviewCount: 100,
        category: 'Electronics',
    };

    beforeEach(() => {
        vi.mocked(cartStore.useCartStore).mockReturnValue({
            addItem: mockAddItem,
        } as any);
        mockAddItem.mockClear();
    });

    it('renders product details correctly', () => {
        render(
            <BrowserRouter>
                <ProductCard {...mockProduct} />
            </BrowserRouter>
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('999')).toBeInTheDocument();
        expect(screen.getByText('(100)')).toBeInTheDocument();
        expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    it('shows prime badge when isPrime is true', () => {
        render(
            <BrowserRouter>
                <ProductCard {...mockProduct} isPrime={true} />
            </BrowserRouter>
        );

        expect(screen.getByText('Prime')).toBeInTheDocument();
    });

    it('calculates and shows discount correctly', () => {
        render(
            <BrowserRouter>
                <ProductCard {...mockProduct} originalPrice={2000} />
            </BrowserRouter>
        );

        expect(screen.getByText('₹2,000')).toBeInTheDocument();
        expect(screen.getByText('(50% off)')).toBeInTheDocument();
    });

    it('calls addItem when Add to Cart button is clicked', () => {
        render(
            <BrowserRouter>
                <ProductCard {...mockProduct} />
            </BrowserRouter>
        );

        const addButton = screen.getByText('Add to Cart');
        fireEvent.click(addButton);

        expect(mockAddItem).toHaveBeenCalledWith({
            productId: '1',
            name: 'Test Product',
            price: 999,
            imageUrl: '/test-image.jpg',
            quantity: 1,
        });
    });
});
