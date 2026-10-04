"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) { return <div className="glass p-10 text-center"><h1 className="text-2xl font-semibold">Something went wrong</h1><button className="btn-primary mt-6" onClick={reset}>Try again</button></div>; }
