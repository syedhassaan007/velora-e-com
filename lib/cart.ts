"use client";
import { useEffect, useState } from "react";
export type CartLine = { productId: string; slug: string; name: string; image: string; price: number; stock: number; qty: number };
const KEY = "velora-cart";
const read = (): CartLine[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; } };
const write = (l: CartLine[]) => { localStorage.setItem(KEY, JSON.stringify(l)); window.dispatchEvent(new Event("cart")); };
export const cart = {
  add(line: Omit<CartLine, "qty">, qty = 1) {
    const l = read(); const f = l.find((x) => x.productId === line.productId);
    if (f) f.qty = Math.min(f.qty + qty, line.stock); else l.push({ ...line, qty: Math.min(qty, line.stock) });
    write(l);
  },
  setQty(id: string, qty: number) { write(read().map((x) => x.productId === id ? { ...x, qty: Math.max(1, Math.min(qty, x.stock)) } : x)); },
  remove(id: string) { write(read().filter((x) => x.productId !== id)); },
  clear() { write([]); },
};
export function useCart() {
  const [lines, set] = useState<CartLine[]>([]);
  useEffect(() => { const s = () => set(read()); s(); window.addEventListener("cart", s); return () => window.removeEventListener("cart", s); }, []);
  return lines;
}
