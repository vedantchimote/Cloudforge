import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CartItemComponent from './CartItem';
import * as cartStore from '@/store/cartStore';

// Mock the cart store
vi.mock('@/store/cartStore', () => ({
    useCartStore: vi.fn(),
}));

describe('CartItem', () => {
    const mockUpdateQuantity = vi.fn();
    const mockRemoveItem = vi.fn();
    const mockItem = {
        productId: '1',
        name: 'Test Product',
        price: 1000,
        imageUrl: '/test-image.jpg',
        quantity: 2,
    };

    beforeEach(() => {
        vi.mocked(cartStore.useCartStore).mockReturnValue({
            updateQuantity: mockUpdateQuantity,
            removeItem: mockRemoveItem,
        } as any);
        mockUpdateQuantity.mockClear();
        mockRemoveItem.mockClear();
    });

    it('renders cart item details correctly', () => {
        render(
            <BrowserRouter>
                <CartItemComponent item={mockItem} />
            </BrowserRouter>
        );

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        // Total price: 1000 * 2 = 2000
        expect(screen.getByText('₹2,000')).toBeInTheDocument();
        expect(screen.getByText('₹1,000 each')).toBeInTheDocument();
    });

    it('calls updateQuantity when +/- buttons are clicked', () => {
        render(
            <BrowserRouter>
                <CartItemComponent item={mockItem} />
            </BrowserRouter>
        );

        const minusButton = screen.getAllByRole('button')[0];
        const plusButton = screen.getAllByRole('button')[1];

        fireEvent.click(plusButton);
        expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3);

        fireEvent.click(minusButton);
        expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 1);
    });

    it('calls removeItem when delete button is clicked', () => {
        render(
            <BrowserRouter>
                <CartItemComponent item={mockItem} />
            </BrowserRouter>
        );

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        expect(mockRemoveItem).toHaveBeenCalledWith('1');
    });

    it('disables minus button when quantity is 1', () => {
        const singleItem = { ...mockItem, quantity: 1 };
        render(
            <BrowserRouter>
                <CartItemComponent item={singleItem} />
            </BrowserRouter>
        );

        // First button is minus
        const minusButton = screen.getAllByRole('button')[0];
        expect(minusButton).toBeDisabled();
    });
});
