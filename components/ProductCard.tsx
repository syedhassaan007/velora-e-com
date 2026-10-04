import Image from "next/image";
import Link from "next/link";
import { fmt } from "@/lib/money";
import type { Product } from "@prisma/client";

export default function ProductCard({ p, tall }: { p: Product; tall?: boolean }) {
  return (
    <Link href={`/products/${p.slug}`} className={`glass group overflow-hidden transition hover:-translate-y-1 hover:border-ember/50 ${tall ? "sm:row-span-2" : ""}`}>
      <div className={`relative overflow-hidden ${tall ? "aspect-[4/5]" : "aspect-square"}`}>
        <Image src={p.image} alt={p.name} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        {p.stock === 0 && <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs">Sold out</span>}
      </div>
      <div className="p-4">
        <p className="text-xs text-bone/50">{p.brand}</p>
        <h3 className="font-medium leading-snug">{p.name}</h3>
        <p className="mt-1">{p.salePrice ? <><span className="text-ember">{fmt(p.salePrice)}</span> <s className="text-bone/40">{fmt(p.price)}</s></> : fmt(p.price)}</p>
      </div>
    </Link>
  );
}
