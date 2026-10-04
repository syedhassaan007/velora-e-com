import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { fmt } from "@/lib/money";
import { StatusSelect } from "@/components/Client";

export default async function Admin() {
  await requireAdmin(); // server-side gate; the API routes enforce the same rule independently
  const [rev, orderCount, users, products, low, recent] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.order.count(), db.user.count(), db.product.count(),
    db.product.findMany({ where: { stock: { lt: 10 } }, orderBy: { stock: "asc" }, take: 6 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } }),
  ]);
  const stats: [string, string | number][] = [["Revenue", fmt(rev._sum.total ?? 0)], ["Orders", orderCount], ["Users", users], ["Products", products]];
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(([k, v]) => <div key={k} className="glass p-5"><p className="text-sm text-bone/60">{k}</p><p className="text-2xl font-semibold">{v}</p></div>)}</div>
      <section className="glass p-5"><h2 className="mb-3 font-semibold">Low stock</h2>{low.map((p) => <div key={p.id} className="flex justify-between py-1"><Link href={`/products/${p.slug}`}>{p.name}</Link><span className={p.stock === 0 ? "text-ember" : ""}>{p.stock} left</span></div>)}</section>
      <section className="glass p-5"><h2 className="mb-3 font-semibold">Recent orders</h2>
        {recent.map((o) => <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3"><Link href={`/orders/${o.id}`}>#{o.id.slice(-8)} · {o.user.name}</Link><span>{fmt(o.total)}</span><StatusSelect id={o.id} status={o.status} /></div>)}
      </section>
    </div>
  );
}
