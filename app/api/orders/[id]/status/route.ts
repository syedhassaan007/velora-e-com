import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

const s = z.object({ status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]) });
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (u.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = s.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  try { return NextResponse.json(await db.order.update({ where: { id: params.id }, data: { status: p.data.status } })); }
  catch { return NextResponse.json({ error: "Order not found" }, { status: 404 }); }
}
