import Link from "next/link";
export default function NotFound() { return <div className="glass p-10 text-center"><h1 className="text-3xl font-semibold">Nothing here</h1><p className="mt-2 text-bone/60">That page drifted off.</p><Link href="/" className="btn-primary mt-6">Back to shop</Link></div>; }
