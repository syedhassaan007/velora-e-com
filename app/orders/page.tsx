import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmt } from "@/lib/money";

export default async function Orders() {
  const u = await requireUser();
  const orders = await db.order.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4"><h1 className="text-2xl font-semibold">Your orders</h1>
      {orders.length === 0 && <p className="glass p-8 text-bone/60">No orders yet.</p>}
      {orders.map((o) => <Link key={o.id} href={`/orders/${o.id}`} className="glass flex justify-between p-5 hover:border-ember/50"><span>#{o.id.slice(-8)} · {o.createdAt.toLocaleDateString()}</span><span>{o.status.replaceAll("_", " ")} · {fmt(o.total)}</span></Link>)}
    </div>
  );
}
