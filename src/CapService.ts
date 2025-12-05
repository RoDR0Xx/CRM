import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Definición de interfaces */
export interface Cap {
    id: string;
    name: string;
    price: number;
    type: 'planas' | 'normales' | 'clasicas' | 'vintage';
    typeName: string;
    color: string;
    colorName: string;
    description: string;
    emoji: string;
    badge?: string;
}

export interface CartItem {
    productId: string;
    qty: number;
    price: number;
}

// --- Datos Fijos del Catálogo ---
const CATEGORIES = {
    planas: { name: 'Planas', price: 25.00, emoji: '😎' },
    normales: { name: 'Normales', price: 30.00, emoji: '🧢' },
    clasicas: { name: 'Clásicas', price: 40.00, emoji: '🎩' },
    vintage: { name: 'Vintage', price: 50.00, emoji: '🪖' }
} as const;

const COLORS = ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Amarillo'];
const LS_CART_KEY = 'tienda_gorras_cart_v2';

@Injectable({
    providedIn: 'root',
})
export class CapService {
    
    private _products: Cap[] = this.generateProducts();
    private _cart$ = new BehaviorSubject<CartItem[]>(this.loadCartFromStorage());
    public readonly cart$: Observable<CartItem[]> = this._cart$.asObservable();

    constructor() {}

    private generateProducts(): Cap[] {
        const products: Cap[] = [];
        let idCounter = 1;
        const categoryKeys = Object.keys(CATEGORIES) as Cap['type'][];
        const productsPerCategory = 24 / categoryKeys.length;

        for (const typeKey of categoryKeys) {
            const category = CATEGORIES[typeKey];
            
            for (let j = 0; j < productsPerCategory; j++) {
                const colorName = COLORS[j % COLORS.length];
                const colorSlug = colorName.toLowerCase();

                products.push({
                    id: `g${idCounter++}`,
                    name: `Gorra ${category.name} ${colorName}`,
                    type: typeKey,
                    typeName: category.name,
                    color: colorSlug,
                    colorName: colorName,
                    description: `Estilo ${category.name}, color ${colorName}. Calidad premium.`,
                    price: category.price,
                    emoji: category.emoji,
                    badge: (j === 0 && typeKey === 'planas') ? 'Nuevo' : undefined
                });
            }
        }
        return products;
    }

    // Métodos de acceso a datos
    getAllCaps(): Cap[] { return [...this._products]; }
    getCapTypes(): { key: Cap['type'], name: string }[] {
        return Object.entries(CATEGORIES).map(([key, value]) => ({ key: key as Cap['type'], name: value.name }));
    }
    getCapById(id: string): Cap | undefined { return this._products.find(p => p.id === id); }

    // Métodos del carrito
    private loadCartFromStorage(): CartItem[] {
        try {
            const raw = localStorage.getItem(LS_CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    private saveCart(cart: CartItem[]): void {
        localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
        this._cart$.next(cart);
    }

    addToCart(productId: string, qty: number = 1): void {
        const product = this.getCapById(productId);
        if (!product) return;
        const currentCart = this._cart$.getValue();
        const existingItem = currentCart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.qty += qty;
        } else {
            currentCart.push({ productId, qty, price: product.price });
        }
        this.saveCart(currentCart);
    }
    
    updateCartItemQty(productId: string, delta: number): void {
        let currentCart = this._cart$.getValue();
        const item = currentCart.find(i => i.productId === productId);
        
        if (!item) return;
        item.qty += delta;

        if (item.qty <= 0) {
            currentCart = currentCart.filter(i => i.productId !== productId);
        }
        this.saveCart(currentCart);
    }

    getCartTotal(cart: CartItem[]): number {
        return cart.reduce((total, item) => total + item.price * item.qty, 0);
    }

    getCartItemsCount(cart: CartItem[]): number {
        return cart.reduce((total, item) => total + item.qty, 0);
    }

    clearCart(): void {
        this.saveCart([]);
    }
}