import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";

const STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
export default async function OrderPage({ params }: { params: { id: string } }) {
  const u = await requireUser();
  const o = await db.order.findUnique({ where: { id: params.id }, include: { items: { include: { product: true } } } });
  // Return 404 (not 403) for other people's orders so IDs can't be probed.
  if (!o || (o.userId !== u.id && u.role !== "ADMIN")) notFound();
  const idx = STEPS.indexOf(o.status as (typeof STEPS)[number]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Order #{o.id.slice(-8)}</h1>
      {o.status === "CANCELLED" ? <p className="glass p-5 text-ember">This order was cancelled.</p> : (
        <ol className="glass grid gap-4 p-6 sm:grid-cols-6" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === idx ? "step" : undefined} className={`text-sm ${i <= idx ? "text-bone" : "text-bone/30"}`}>
              <div className={`mb-2 h-1.5 rounded-full transition-all duration-700 ${i < idx ? "bg-lichen" : i === idx ? "bg-ember" : "bg-line"}`} />
              {s === "PENDING" ? "Placed" : s.replaceAll("_", " ").toLowerCase()}
            </li>
          ))}
        </ol>
      )}
      <div className="glass divide-y divide-line">
        {o.items.map((i) => <div key={i.id} className="flex justify-between p-4"><span>{i.product.name} × {i.quantity}</span><span>{fmt(i.unitPrice * i.quantity)}</span></div>)}
        <div className="flex justify-between p-4 font-semibold"><span>Total (incl. shipping & tax)</span><span>{fmt(o.total)}</span></div>
      </div>
    </div>
  );
}
