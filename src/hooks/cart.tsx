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
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      // await AsyncStorage.removeItem('@GoMarketplace:cart');
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:cart',
      );
      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const hasProductOnCart = products.find(pr => {
        return pr.id === product.id;
      });
      if (hasProductOnCart) {
        hasProductOnCart.quantity += 1;
        const returnFilterProducts = products.filter(pr => {
          return pr.id !== hasProductOnCart.id;
        });
        const newProducts = [...returnFilterProducts, hasProductOnCart];
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(newProducts),
        );
      } else {
        const newProducts = [...products, { ...product, quantity: 1 }];
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const findProductToIncrement = products.find(product => {
        return product.id === id;
      });
      if (findProductToIncrement) {
        findProductToIncrement.quantity += 1;

        const returnFilterProducts = products.filter(pr => {
          return pr.id !== id;
        });

        setProducts(() => {
          return [...returnFilterProducts, findProductToIncrement];
        });

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const findProductToDecrement = products.find(product => {
        return product.id === id;
      });

      if (findProductToDecrement) {
        const returnFilterProducts = products.filter(pr => {
          return pr.id !== findProductToDecrement.id;
        });
        if (findProductToDecrement.quantity === 1) {
          returnFilterProducts
            ? setProducts(returnFilterProducts)
            : setProducts([]);

          await AsyncStorage.setItem(
            '@GoMarketplace:cart',
            JSON.stringify(returnFilterProducts),
          );
        } else {
          findProductToDecrement.quantity -= 1;

          setProducts([...returnFilterProducts, findProductToDecrement]);
          await AsyncStorage.setItem(
            '@GoMarketplace:cart',
            JSON.stringify([...returnFilterProducts, findProductToDecrement]),
          );
        }
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
