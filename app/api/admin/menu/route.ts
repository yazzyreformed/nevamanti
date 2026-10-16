import { applyPrices, ConflictError, isAuthed, readMenu, writeMenu, type PriceUpdate } from "@/lib/admin";

const unauthorized = () => Response.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
const conflict = () =>
  Response.json(
    { error: "Menü bu arada başka yerden değişmiş. Sayfayı yenileyip tekrar deneyin." },
    { status: 409 }
  );

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  try {
    return Response.json(await readMenu());
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthed())) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body || typeof body.sha !== "string" || !Array.isArray(body.prices)) {
    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  try {
    const { menu, sha } = await readMenu();
    if (sha !== body.sha) return conflict();

    const changes = applyPrices(menu, body.prices as PriceUpdate[]);
    if (changes.length === 0) return Response.json({ ok: true, changes });

    await writeMenu(menu, sha, `fix: admin panelden fiyat guncellemesi\n\n${changes.join("\n")}`);
    const fresh = await readMenu();
    return Response.json({ ok: true, changes, sha: fresh.sha });
  } catch (e) {
    if (e instanceof ConflictError) return conflict();
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
