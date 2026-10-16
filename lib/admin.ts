import { createHash, createHmac, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import type { MenuCategory } from "@/lib/menu";

export const SESSION_COOKIE = "neva_admin";
const MENU_PATH = "data/menu.json";

const safeEqual = (a: string, b: string) => {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

const adminPassword = () => process.env.ADMIN_PASSWORD || "";

// Şifre değişince eski oturumlar da geçersiz olur
export const sessionToken = () =>
  createHmac("sha256", adminPassword()).update("neva-admin-session-v1").digest("hex");

export const checkPassword = (input: string) =>
  adminPassword().length > 0 && safeEqual(input, adminPassword());

export async function isAuthed() {
  if (!adminPassword()) return false;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!value && safeEqual(value, sessionToken());
}

// GITHUB_TOKEN yoksa (lokal geliştirme) dosyayı doğrudan diskten oku/yaz
const hasGitHubToken = () => !!process.env.GITHUB_TOKEN;

const githubUrl = () => {
  const repo = process.env.GITHUB_REPO || "yazzyreformed/nevamanti";
  return `https://api.github.com/repos/${repo}/contents/${MENU_PATH}`;
};
const githubBranch = () => process.env.GITHUB_BRANCH || "main";

const githubHeaders = () => ({
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

export async function readMenu(): Promise<{ menu: MenuCategory[]; sha: string }> {
  if (!hasGitHubToken()) {
    if (process.env.NODE_ENV === "production") throw new Error("GITHUB_TOKEN tanımlı değil");
    const raw = await fs.readFile(path.join(process.cwd(), MENU_PATH), "utf8");
    return { menu: JSON.parse(raw), sha: createHash("sha1").update(raw).digest("hex") };
  }
  const res = await fetch(`${githubUrl()}?ref=${githubBranch()}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub okuma hatası: ${res.status}`);
  const data = await res.json();
  const raw = Buffer.from(data.content, "base64").toString("utf8");
  return { menu: JSON.parse(raw), sha: data.sha };
}

export async function writeMenu(menu: MenuCategory[], sha: string, message: string) {
  const raw = JSON.stringify(menu, null, 2) + "\n";
  if (!hasGitHubToken()) {
    await fs.writeFile(path.join(process.cwd(), MENU_PATH), raw, "utf8");
    return;
  }
  const res = await fetch(githubUrl(), {
    method: "PUT",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(raw, "utf8").toString("base64"),
      sha,
      branch: githubBranch(),
    }),
  });
  if (res.status === 409) throw new ConflictError();
  if (!res.ok) throw new Error(`GitHub yazma hatası: ${res.status}`);
}

export class ConflictError extends Error {}

export type PriceUpdate = {
  categoryId: string;
  name: string;
  price: number;
  extraPrice?: number;
};

const validPrice = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n > 0 && n <= 100000;

// Panel yalnızca fiyatları değiştirebilir; isim, görsel vb. alanlara dokunulmaz
export function applyPrices(menu: MenuCategory[], updates: PriceUpdate[]) {
  const changes: string[] = [];
  for (const u of updates) {
    const item = menu.find((c) => c.id === u.categoryId)?.items.find((i) => i.name === u.name);
    if (!item) throw new Error(`Ürün bulunamadı: ${u.name}`);
    if (!validPrice(u.price)) throw new Error(`Geçersiz fiyat: ${u.name}`);
    if (item.price !== u.price) {
      changes.push(`${item.name} ${item.price}→${u.price}`);
      item.price = u.price;
    }
    if (item.extraPrice !== undefined && u.extraPrice !== undefined) {
      if (!validPrice(u.extraPrice)) throw new Error(`Geçersiz fiyat: ${u.name}`);
      if (item.extraPrice !== u.extraPrice) {
        changes.push(`${item.name} (${item.extraLabel}) ${item.extraPrice}→${u.extraPrice}`);
        item.extraPrice = u.extraPrice;
      }
    }
  }
  return changes;
}
