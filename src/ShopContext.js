import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from './store';

const CART_KEY = 'shopemart_cart_v1';
const WISH_KEY = 'shopemart_wishlist_v1';

const ShopContext = createContext(null);

/** a line is a product in one colour and one size, so the same product in two colours is two lines */
export const lineKey = (i) => `${i.productId}|${i.color || ''}|${i.size || ''}`;

/**
 * The basket and the wishlist, kept on the phone (no login needed to shop). The basket only remembers what to ask the server for
 * (product, colour, size, how many) and the price it saw last: the server prices the order at checkout, never the phone.
 */
export function ShopProvider({ children }) {
  const [items, setItems] = useState([]);
  const [wish, setWish] = useState([]); // product ids
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setItems(await load(CART_KEY, []));
      setWish(await load(WISH_KEY, []));
      setLoaded(true);
    })();
  }, []);
  useEffect(() => { if (loaded) save(CART_KEY, items); }, [items, loaded]);
  useEffect(() => { if (loaded) save(WISH_KEY, wish); }, [wish, loaded]);

  const add = useCallback((line) => {
    setItems((old) => {
      const found = old.find((i) => lineKey(i) === lineKey(line));
      if (found) return old.map((i) => (lineKey(i) === lineKey(line) ? { ...i, qty: i.qty + (line.qty || 1), price: line.price } : i));
      return [...old, { ...line, qty: line.qty || 1 }];
    });
  }, []);
  const setQty = useCallback((key, qty) => setItems((old) => old.map((i) => (lineKey(i) === key ? { ...i, qty: Math.max(1, qty) } : i))), []);
  const remove = useCallback((key) => setItems((old) => old.filter((i) => lineKey(i) !== key)), []);
  const clear = useCallback(() => setItems([]), []);
  const toggleWish = useCallback((id) => setWish((old) => (old.includes(id) ? old.filter((x) => x !== id) : [id, ...old])), []);

  const value = useMemo(() => ({
    items, count: items.reduce((s, i) => s + i.qty, 0), subtotal: items.reduce((s, i) => s + Number(i.price) * i.qty, 0),
    add, setQty, remove, clear, wish, toggleWish, isWished: (id) => wish.includes(id), loaded,
  }), [items, wish, add, setQty, remove, clear, toggleWish, loaded]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
