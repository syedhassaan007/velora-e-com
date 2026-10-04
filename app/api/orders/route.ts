import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { calc } from "@/lib/money";

const body = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(20) })).min(1),
  address: z.object({ line1: z.string().min(3), city: z.string().min(2), postal: z.string().min(3), country: z.string().min(2) }),
  payment: z.literal("SANDBOX"), // swap for a Stripe PaymentIntent id when a gateway is added
});

export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  return NextResponse.json(await db.order.findMany({ where: u.role === "ADMIN" ? {} : { userId: u.id }, orderBy: { createdAt: "desc" }, include: { items: true } }));
}

export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const p = body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  try {
    const order = await db.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: p.data.items.map((i) => i.productId) } } });
      let subtotal = 0;
      const lines = p.data.items.map((i) => {
        const prod = products.find((x) => x.id === i.productId);
        if (!prod) throw new Error("Product unavailable");
        if (prod.stock < i.qty) throw new Error(`Only ${prod.stock} left of ${prod.name}`);
        const unit = prod.salePrice ?? prod.price; // price always comes from the DB, never the client
        subtotal += unit * i.qty;
        return { productId: prod.id, quantity: i.qty, unitPrice: unit };
      });
      for (const l of lines) {
        // Conditional decrement guards against two buyers racing for the last unit.
        const r = await tx.product.updateMany({ where: { id: l.productId, stock: { gte: l.quantity } }, data: { stock: { decrement: l.quantity } } });
        if (r.count === 0) throw new Error("Stock changed while ordering. Please review your cart.");
      }
      const address = await tx.address.create({ data: { ...p.data.address, userId: u.id } });
      return tx.order.create({ data: { userId: u.id, addressId: address.id, ...calc(subtotal), items: { create: lines } } });
    });
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not place order" }, { status: 409 });
  }
}
