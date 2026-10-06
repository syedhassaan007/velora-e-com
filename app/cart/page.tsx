"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cart, useCart } from "@/lib/cart";
import { calc, fmt } from "@/lib/money";

export default function CartPage() {
  const lines = useCart(); const r = useRouter();
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const t = calc(lines.reduce((a, l) => a + l.price * l.qty, 0));
  if (lines.length === 0) return <div className="glass p-10 text-center"><h1 className="text-2xl font-semibold">Your cart is empty</h1><Link href="/" className="btn-primary mt-6">Keep shopping</Link></div>;
  async function checkout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f: Record<string, string> = {};
    new FormData(e.currentTarget).forEach((v, k) => { f[k] = String(v); });
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: lines.map((l) => ({ productId: l.productId, qty: l.qty })), address: { line1: f.line1, city: f.city, postal: f.postal, country: f.country }, payment: "SANDBOX" }) });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { r.push("/login"); return; }
    if (res.ok) { cart.clear(); r.push(`/orders/${data.id}`); } else { setErr(data.error ?? "Could not place order."); setBusy(false); }
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section aria-label="Cart items" className="space-y-3">
        <h1 className="text-2xl font-semibold">Cart</h1>
        {lines.map((l) => (
          <div key={l.productId} className="glass flex items-center gap-4 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.image} alt={l.name} className="h-20 w-20 rounded-2xl object-cover" />
            <div className="flex-1"><Link href={`/products/${l.slug}`} className="font-medium">{l.name}</Link><p className="text-bone/60">{fmt(l.price)}</p></div>
            <div className="flex items-center gap-1">
              <button aria-label="Decrease" className="btn-ghost !px-3" onClick={() => cart.setQty(l.productId, l.qty - 1)}><Minus size={16} /></button>
              <span className="w-6 text-center">{l.qty}</span>
              <button aria-label="Increase" className="btn-ghost !px-3" disabled={l.qty >= l.stock} onClick={() => cart.setQty(l.productId, l.qty + 1)}><Plus size={16} /></button>
              <button aria-label="Remove" className="btn-ghost !px-3" onClick={() => cart.remove(l.productId)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </section>
      <form onSubmit={checkout} className="glass h-fit space-y-3 p-6">
        <h2 className="text-lg font-semibold">Checkout</h2>
        <input name="line1" required placeholder="Street address" aria-label="Street address" className="input" />
        <div className="grid grid-cols-2 gap-3"><input name="city" required placeholder="City" aria-label="City" className="input" /><input name="postal" required placeholder="Postal code" aria-label="Postal code" className="input" /></div>
        <input name="country" required placeholder="Country" aria-label="Country" className="input" />
        <p className="rounded-2xl border border-line p-3 text-sm text-bone/60">Sandbox payment: no card is charged and no real transaction occurs.</p>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{fmt(t.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{t.shipping ? fmt(t.shipping) : "Free"}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd>{fmt(t.tax)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{fmt(t.total)}</dd></div>
        </dl>
        {err && <p role="alert" className="text-ember">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Placing order…" : "Place order"}</button>
      </form>
    </div>
  );
}
