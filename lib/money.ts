export const fmt = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
export const SHIPPING_FREE_OVER = 10000;
export const calc = (subtotal: number) => {
  const shipping = subtotal === 0 || subtotal >= SHIPPING_FREE_OVER ? 0 : 900;
  const tax = Math.round(subtotal * 0.08);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
};
