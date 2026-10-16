"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuCategory } from "@/lib/menu";

type Draft = Record<string, { price: string; extraPrice?: string }>;

const keyOf = (categoryId: string, name: string) => `${categoryId}::${name}`;

const toDraft = (menu: MenuCategory[]): Draft => {
  const draft: Draft = {};
  for (const c of menu)
    for (const i of c.items)
      draft[keyOf(c.id, i.name)] = {
        price: String(i.price),
        extraPrice: i.extraPrice !== undefined ? String(i.extraPrice) : undefined,
      };
  return draft;
};

const isValid = (v: string) => /^\d{1,6}$/.test(v) && Number(v) > 0;

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [menu, setMenu] = useState<MenuCategory[] | null>(null);
  const [sha, setSha] = useState("");
  const [draft, setDraft] = useState<Draft>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const loadMenu = async () => {
    const res = await fetch("/api/admin/menu", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) setAuthed(false);
      setMessage({ type: "error", text: data.error || "Menü yüklenemedi" });
      return;
    }
    setMenu(data.menu);
    setSha(data.sha);
    setDraft(toDraft(data.menu));
  };

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.authed);
        if (d.authed) loadMenu();
      })
      .catch(() => setAuthed(false));
  }, []);

  const original = useMemo(() => (menu ? toDraft(menu) : {}), [menu]);

  const changedKeys = useMemo(
    () =>
      Object.keys(draft).filter(
        (k) => draft[k].price !== original[k]?.price || draft[k].extraPrice !== original[k]?.extraPrice
      ),
    [draft, original]
  );

  const hasInvalid = Object.values(draft).some(
    (d) => !isValid(d.price) || (d.extraPrice !== undefined && !isValid(d.extraPrice))
  );

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage({ type: "error", text: "Şifre yanlış" });
      return;
    }
    setPassword("");
    setAuthed(true);
    loadMenu();
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setMenu(null);
  };

  const save = async () => {
    if (!menu) return;
    setBusy(true);
    setMessage(null);
    const prices = changedKeys.map((k) => {
      const [categoryId, name] = k.split("::");
      const d = draft[k];
      return {
        categoryId,
        name,
        price: Number(d.price),
        ...(d.extraPrice !== undefined ? { extraPrice: Number(d.extraPrice) } : {}),
      };
    });
    const res = await fetch("/api/admin/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha, prices }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Kaydedilemedi" });
      return;
    }
    // Kaydedilen değerleri yeni "orijinal" olarak işaretle
    setMenu(
      menu.map((c) => ({
        ...c,
        items: c.items.map((i) => {
          const d = draft[keyOf(c.id, i.name)];
          return {
            ...i,
            price: Number(d.price),
            ...(i.extraPrice !== undefined ? { extraPrice: Number(d.extraPrice) } : {}),
          };
        }),
      }))
    );
    if (data.sha) setSha(data.sha);
    setMessage({
      type: "ok",
      text: "Kaydedildi. Yeni fiyatlar 1-2 dakika içinde sitede görünecek.",
    });
  };

  const update = (k: string, field: "price" | "extraPrice", value: string) =>
    setDraft((prev) => ({ ...prev, [k]: { ...prev[k], [field]: value.replace(/\D/g, "") } }));

  const inputClass = (value: string, changed: boolean) =>
    `w-24 rounded-lg border px-3 py-2 text-right text-lg font-serif outline-none focus:ring-2 focus:ring-[#8B5A2B]/40 ${
      !isValid(value)
        ? "border-red-400 bg-red-50"
        : changed
        ? "border-[#8B5A2B] bg-[#8B5A2B]/5"
        : "border-stone-300 bg-white"
    }`;

  return (
    <div className="min-h-screen bg-[#F9F9F6] pt-32 pb-40 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2A3B2C]">Fiyat Paneli</h1>
          {authed && (
            <button onClick={logout} className="text-sm text-stone-500 underline underline-offset-4">
              Çıkış
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              message.type === "ok" ? "bg-[#2A3B2C]/10 text-[#2A3B2C]" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {authed === null && <p className="text-stone-500">Yükleniyor…</p>}

        {authed === false && (
          <form onSubmit={login} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-semibold uppercase tracking-[0.15em] text-[#2A3B2C]">
              Şifre
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-[#8B5A2B]/40"
            />
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full rounded-full bg-[#2A3B2C] py-3 font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50"
            >
              {busy ? "Kontrol ediliyor…" : "Giriş"}
            </button>
          </form>
        )}

        {authed && !menu && !message && <p className="text-stone-500">Menü yükleniyor…</p>}

        {authed && menu && (
          <div className="space-y-10">
            {menu.map((c) => (
              <section key={c.id}>
                <h2 className="mb-3 text-2xl font-serif text-[#8B5A2B]">{c.category}</h2>
                <div className="divide-y divide-stone-200 rounded-2xl bg-white shadow-sm">
                  {c.items.map((i) => {
                    const k = keyOf(c.id, i.name);
                    const d = draft[k];
                    if (!d) return null;
                    return (
                      <div key={k} className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-serif text-lg text-[#2A3B2C] leading-tight">{i.name}</span>
                          <label className="flex shrink-0 items-center gap-2">
                            <input
                              inputMode="numeric"
                              value={d.price}
                              onChange={(e) => update(k, "price", e.target.value)}
                              className={inputClass(d.price, d.price !== original[k]?.price)}
                              aria-label={`${i.name} fiyatı`}
                            />
                            <span className="text-stone-500">TL</span>
                          </label>
                        </div>
                        {d.extraPrice !== undefined && (
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="pl-4 text-sm italic text-stone-600">{i.extraLabel}</span>
                            <label className="flex shrink-0 items-center gap-2">
                              <input
                                inputMode="numeric"
                                value={d.extraPrice}
                                onChange={(e) => update(k, "extraPrice", e.target.value)}
                                className={inputClass(d.extraPrice, d.extraPrice !== original[k]?.extraPrice)}
                                aria-label={`${i.name} ${i.extraLabel} fiyatı`}
                              />
                              <span className="text-stone-500">TL</span>
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {authed && menu && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-[#F9F9F6]/95 px-4 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <button
              onClick={() => setDraft(toDraft(menu))}
              disabled={busy || changedKeys.length === 0}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-600 disabled:opacity-40"
            >
              Geri al
            </button>
            <button
              onClick={save}
              disabled={busy || changedKeys.length === 0 || hasInvalid}
              className="flex-1 rounded-full bg-[#2A3B2C] py-3 font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-40"
            >
              {busy
                ? "Kaydediliyor…"
                : changedKeys.length === 0
                ? "Değişiklik yok"
                : `Kaydet (${changedKeys.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
