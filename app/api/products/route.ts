import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const where: Prisma.ProductWhereInput = {
    ...(q.get("q") && { OR: [{ name: { contains: q.get("q")!, mode: "insensitive" } }, { brand: { contains: q.get("q")!, mode: "insensitive" } }] }),
    ...(q.get("category") && { category: { slug: q.get("category")! } }),
    ...(q.get("inStock") === "1" && { stock: { gt: 0 } }),
    ...(q.get("minRating") && { rating: { gte: Number(q.get("minRating")) || 0 } }),
  };
  const sort = q.get("sort");
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : sort === "rating" ? { rating: "desc" } : sort === "popular" ? { reviewCount: "desc" } : { createdAt: "desc" };
  const page = Math.max(1, Number(q.get("page")) || 1);
  const [items, total] = await Promise.all([db.product.findMany({ where, orderBy, skip: (page - 1) * 12, take: 12 }), db.product.count({ where })]);
  return NextResponse.json({ items, total, page });
}

const create = z.object({ name: z.string().min(2), slug: z.string().min(2), sku: z.string().min(2), shortDesc: z.string(), description: z.string(), price: z.number().int().positive(), salePrice: z.number().int().positive().nullable().optional(), image: z.string().url(), brand: z.string(), stock: z.number().int().min(0), categoryId: z.string() });
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (u.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = create.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid product data", issues: p.error.flatten() }, { status: 400 });
  try { return NextResponse.json(await db.product.create({ data: p.data }), { status: 201 }); }
  catch { return NextResponse.json({ error: "Slug or SKU already exists" }, { status: 409 }); }
}
