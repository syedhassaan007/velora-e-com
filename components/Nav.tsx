import Link from "next/link";
import { getUser } from "@/lib/auth";
import { CartBadge, LogoutButton } from "./Client";

export default async function Nav() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/70 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-semibold tracking-tight">velora<span className="text-ember">.</span></Link>
        <Link href="/?category=audio" className="hidden sm:block text-bone/70 hover:text-bone">Audio</Link>
        <Link href="/?category=wearables" className="hidden sm:block text-bone/70 hover:text-bone">Wearables</Link>
        <Link href="/?category=workspace" className="hidden sm:block text-bone/70 hover:text-bone">Workspace</Link>
        <div className="ml-auto flex items-center gap-2">
          {user?.role === "ADMIN" && <Link href="/admin" className="btn-ghost">Admin</Link>}
          {user ? (<><Link href="/orders" className="btn-ghost">Orders</Link><LogoutButton /></>) : <Link href="/login" className="btn-ghost">Sign in</Link>}
          <CartBadge />
        </div>
      </nav>
    </header>
  );
}
