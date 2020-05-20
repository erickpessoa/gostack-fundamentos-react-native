import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([] as Product[]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const itemsCart = await AsyncStorage.getItem('@GoMarketPlace:cart');
      if (itemsCart) {
        setProducts([...JSON.parse(itemsCart)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productCart = products.find(item => item.id === product.id);

      if (!productCart) {
        setProducts([{ ...product, quantity: 1 }, ...products]);
      } else {
        setProducts([
          { ...product, quantity: productCart.quantity + 1 },
          ...products.filter(p => p.id !== productCart.id),
        ]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const product = products.find(p => p.id === id);

      if (product) {
        setProducts(
          products.map(item => {
            const { quantity }: Product = item;
            if (item.id === id) {
              return {
                ...item,
                quantity: quantity + 1,
              };
            }
            return item;
          }),
        );

        await AsyncStorage.setItem(
          '@GoMarketPlace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const product = products.find(p => p.id === id);
      if (product) {
        if (product.quantity === 1) {
          setProducts(products.filter(item => item.id !== id));
        } else {
          setProducts(
            products.map(item => {
              const { quantity }: Product = item;
              if (item.id === id) {
                return {
                  ...item,
                  quantity: quantity - 1,
                };
              }
              return item;
            }),
          );
        }

        await AsyncStorage.setItem(
          '@GoMarketPlace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
