import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
const cats = ["Audio", "Wearables", "Workspace"];
const P: [string, string, string, number, number | null, number, string][] = [
  ["Halo Open-Back Headphones", "Audio", "Aurelia", 24900, 19900, 24, "Planar drivers, 40h battery, walnut cups."],
  ["Tern Wireless Earbuds", "Audio", "Aurelia", 12900, null, 60, "Adaptive noise control in a pocket-sized case."],
  ["Basalt Desk Speaker", "Audio", "Monolith", 17900, null, 15, "Room-filling stereo from a stone-textured shell."],
  ["Lumen Turntable", "Audio", "Monolith", 39900, 34900, 8, "Belt-drive deck with a pre-mounted cartridge."],
  ["Ripple Bluetooth Soundbar", "Audio", "Monolith", 22900, null, 12, "Three-channel bar with dialogue boost."],
  ["Orbit Smartwatch S2", "Wearables", "Kairo", 29900, 26900, 30, "AMOLED display, 9-day battery, sapphire glass."],
  ["Kairo Band Lite", "Wearables", "Kairo", 7900, null, 80, "Slim tracker with sleep and heart-rate sensing."],
  ["Strata Ring", "Wearables", "Kairo", 34900, null, 5, "Titanium smart ring, no subscription."],
  ["Pulse Sport Strap", "Wearables", "Kairo", 3900, 2900, 120, "Sweat-proof fluoroelastomer in six colours."],
  ["Drift Travel Tracker", "Wearables", "Kairo", 4900, null, 3, "Find-my compatible tag with a 2-year battery."],
  ["Slab Mechanical Keyboard", "Workspace", "Forge", 15900, null, 22, "75% hot-swap board, gasket mounted, PBT keycaps."],
  ["Gliss Ergonomic Mouse", "Workspace", "Forge", 8900, 7400, 40, "Vertical grip, 4000 dpi, USB-C charging."],
  ["Terrace Monitor Light", "Workspace", "Forge", 5900, null, 0, "Asymmetric bar light that never glares the screen."],
  ["Anchor Aluminium Stand", "Workspace", "Forge", 6900, null, 35, "CNC laptop riser with cable channel."],
  ["Mesa Desk Mat XL", "Workspace", "Forge", 3500, 2900, 90, "Wool felt and vegan leather, 90x40 cm."],
  ["Vertex USB-C Dock", "Workspace", "Forge", 14900, null, 18, "11-in-1 dock with dual 4K output."],
];
async function main() {
  const [adminPw, userPw] = await Promise.all([bcrypt.hash("Admin@12345", 12), bcrypt.hash("User@12345", 12)]);
  await db.user.upsert({ where: { email: "admin@velora.dev" }, update: {}, create: { name: "Ines Carvalho", email: "admin@velora.dev", password: adminPw, role: "ADMIN" } });
  const user = await db.user.upsert({ where: { email: "maya@velora.dev" }, update: {}, create: { name: "Maya Raman", email: "maya@velora.dev", password: userPw } });
  const catRows: Record<string, string> = {};
  for (const c of cats) catRows[c] = (await db.category.upsert({ where: { slug: c.toLowerCase() }, update: {}, create: { name: c, slug: c.toLowerCase() } })).id;
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
  for (const [i, [name, cat, brand, price, sale, stock, desc]] of P.entries()) {
    await db.product.upsert({ where: { slug: slug(name) }, update: {}, create: {
      name, slug: slug(name), sku: `VEL-${String(i + 100)}`, shortDesc: desc, description: `${desc} Backed by a 2-year warranty and 30-day returns.`,
      price, salePrice: sale, stock, brand, categoryId: catRows[cat], featured: i % 4 === 0,
      image: `https://picsum.photos/seed/${slug(name)}/800/800`, rating: 3.8 + (i % 5) * 0.25, reviewCount: 12 + i * 7 } });
  }
  if ((await db.order.count()) === 0) {
    const addr = await db.address.create({ data: { userId: user.id, line1: "14 Harbour Row", city: "Chennai", postal: "600001", country: "IN" } });
    const p = await db.product.findFirstOrThrow();
    await db.order.create({ data: { userId: user.id, addressId: addr.id, status: "SHIPPED", subtotal: p.price, shipping: 0, tax: Math.round(p.price * 0.08), total: Math.round(p.price * 1.08), items: { create: { productId: p.id, quantity: 1, unitPrice: p.price } } } });
  }
}
main().finally(() => db.$disconnect());
