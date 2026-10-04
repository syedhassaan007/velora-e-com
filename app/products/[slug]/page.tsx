import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fmt } from "@/lib/money";
import { AddToCart } from "@/components/Client";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await db.product.findUnique({ where: { slug: params.slug }, include: { category: true } });
  if (!p) notFound();
  const related = await db.product.findMany({ where: { categoryId: p.categoryId, id: { not: p.id } }, take: 4 });
  const price = p.salePrice ?? p.price;
  return (
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="glass relative aspect-square overflow-hidden"><Image src={p.image} alt={p.name} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover" /></div>
        <div className="space-y-4">
          <p className="text-lichen">{p.brand} · {p.category.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{p.name}</h1>
          <p className="text-bone/60">★ {p.rating.toFixed(1)} ({p.reviewCount} reviews)</p>
          <p className="text-2xl">{fmt(price)} {p.salePrice && <s className="text-base text-bone/40">{fmt(p.price)}</s>}</p>
          <p className="text-bone/80">{p.description}</p>
          <p className={p.stock > 0 && p.stock < 10 ? "text-ember" : "text-bone/60"}>{p.stock === 0 ? "Out of stock" : p.stock < 10 ? `Only ${p.stock} left` : "In stock"} · SKU {p.sku}</p>
          <AddToCart line={{ productId: p.id, slug: p.slug, name: p.name, image: p.image, price, stock: p.stock }} />
          <p className="text-sm text-bone/50">Free shipping over $100. 30-day returns.</p>
        </div>
      </div>
      <section><h2 className="mb-4 text-xl font-semibold">Related</h2><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div></section>
    </div>
  );
}
