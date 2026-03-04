import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const savedCart = sessionStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1, options = {}) => {
        setCartItems(prev => {
            const existing = prev.find(item =>
                item.product.id === product.id &&
                JSON.stringify(item.options) === JSON.stringify(options)
            );
            if (existing) {
                return prev.map(item =>
                    (item.product.id === product.id && JSON.stringify(item.options) === JSON.stringify(options))
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity, options }];
        });
    };

    const removeFromCart = (productId, options = {}) => {
        setCartItems(prev => prev.filter(item =>
            !(item.product.id === productId && JSON.stringify(item.options) === JSON.stringify(options))
        ));
    };

    const updateQuantity = (productId, quantity, options = {}) => {
        if (quantity < 1) return;
        setCartItems(prev => prev.map(item =>
            (item.product.id === productId && JSON.stringify(item.options) === JSON.stringify(options))
                ? { ...item, quantity }
                : item
        ));
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce((total, item) =>
        total + (item.product.price * item.quantity), 0
    );

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
