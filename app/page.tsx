import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

type SP = { q?: string; category?: string; sort?: string; inStock?: string; page?: string };
export default async function Home({ searchParams: s }: { searchParams: SP }) {
  const filtered = !!(s.q || s.category || s.sort || s.inStock);
  const where: Prisma.ProductWhereInput = {
    ...(s.q && { name: { contains: s.q, mode: "insensitive" } }),
    ...(s.category && { category: { slug: s.category } }),
    ...(s.inStock === "1" && { stock: { gt: 0 } }),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput = s.sort === "price_asc" ? { price: "asc" } : s.sort === "price_desc" ? { price: "desc" } : s.sort === "rating" ? { rating: "desc" } : { createdAt: "desc" };
  const [products, cats] = await Promise.all([db.product.findMany({ where, orderBy, take: 24 }), db.category.findMany()]);
  return (
    <div className="space-y-10">
      {!filtered && (
        <section className="glass relative overflow-hidden p-8 sm:p-14">
          <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-ember/25 blur-3xl" />
          <p className="text-lichen">New season</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">Technology that gets out of the way.</h1>
          <p className="mt-4 max-w-md text-bone/70">Sixteen objects for listening, moving and working. Nothing extra.</p>
          <div className="mt-8 flex gap-3"><Link href="#shop" className="btn-primary">Shop all</Link><Link href="/?category=audio" className="btn-ghost">Explore audio</Link></div>
        </section>
      )}
      <section id="shop" className="space-y-5">
        <form className="flex flex-wrap gap-3" role="search">
          <input name="q" defaultValue={s.q} placeholder="Search products" aria-label="Search" className="input sm:max-w-xs" />
          <select name="category" defaultValue={s.category ?? ""} aria-label="Category" className="input !w-auto"><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
          <select name="sort" defaultValue={s.sort ?? ""} aria-label="Sort" className="input !w-auto"><option value="">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Top rated</option></select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="inStock" value="1" defaultChecked={s.inStock === "1"} /> In stock</label>
          <button className="btn-primary">Apply</button>
        </form>
        {products.length === 0 ? <p className="glass p-10 text-center text-bone/60">No products match those filters.</p> :
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{products.map((p, i) => <ProductCard key={p.id} p={p} tall={!filtered && i === 0} />)}</div>}
      </section>
    </div>
  );
}
