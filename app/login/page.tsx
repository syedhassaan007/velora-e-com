"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const r = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f: Record<string, string> = {};
    new FormData(e.currentTarget).forEach((v, k) => { f[k] = String(v); });
    if (mode === "register" && f.password !== f.confirm) { setErr("Passwords do not match."); setBusy(false); return; }
    const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (res.ok) { r.push("/"); r.refresh(); } else setErr((await res.json().catch(() => ({}))).error ?? "Something went wrong.");
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="glass mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
      {mode === "register" && <label className="block text-sm">Name<input name="name" required className="input mt-1" /></label>}
      <label className="block text-sm">Email<input name="email" type="email" required className="input mt-1" /></label>
      <label className="block text-sm">Password<input name="password" type="password" required minLength={8} className="input mt-1" /></label>
      {mode === "register" && <label className="block text-sm">Confirm password<input name="confirm" type="password" required className="input mt-1" /></label>}
      {err && <p role="alert" className="text-ember">{err}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}</button>
      <button type="button" className="text-sm text-bone/60 underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "New here? Create an account" : "Have an account? Sign in"}</button>
    </form>
  );
}
