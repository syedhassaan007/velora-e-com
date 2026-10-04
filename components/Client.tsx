"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cart, useCart, type CartLine } from "@/lib/cart";

export function CartBadge() {
  const n = useCart().reduce((a, l) => a + l.qty, 0);
  return <Link href="/cart" aria-label={`Cart, ${n} items`} className="btn-primary"><ShoppingBag size={18} />{n > 0 && <span>{n}</span>}</Link>;
}
export function LogoutButton() {
  const r = useRouter();
  return <button className="btn-ghost" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); r.refresh(); r.push("/"); }}>Sign out</button>;
}
export function AddToCart({ line }: { line: Omit<CartLine, "qty"> }) {
  const [done, setDone] = useState(false);
  return (
    <motion.button whileTap={{ scale: 0.96 }} className="btn-primary w-full sm:w-auto" disabled={line.stock === 0}
      onClick={() => { cart.add(line); setDone(true); setTimeout(() => setDone(false), 1400); }}>
      {line.stock === 0 ? "Sold out" : done ? <><Check size={18} /> Added</> : "Add to cart"}
    </motion.button>
  );
}
export function StatusSelect({ id, status }: { id: string; status: string }) {
  const r = useRouter();
  const opts = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
  return (
    <select aria-label="Order status" className="input !w-auto" defaultValue={status}
      onChange={async (e) => { await fetch(`/api/orders/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: e.target.value }) }); r.refresh(); }}>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
