import { getDatabaseBinding } from './_lib/bindings.js';

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT
  );
`;

export async function onRequest({ env, request }) {
  const db = getDatabaseBinding(env);

  if (!db) {
    return new Response("D1 binding not configured", { status: 500 });
  }

  await db.exec(CREATE_TABLE_SQL);

  if (request.method === "POST") {
    const payload = await request.json();
    const { id, date, description, amount, category } = payload ?? {};
    if (!id || !date || !description || typeof amount !== "number") {
      return new Response("Missing required fields", { status: 400 });
    }

    await db.prepare(
      "INSERT INTO transactions (id, date, description, amount, category) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(id, date, description, amount, category ?? null)
      .run();

    return new Response("created", { status: 201 });
  }

  const result = await db.prepare(
    "SELECT id, date, description, amount, category FROM transactions ORDER BY date DESC LIMIT 100"
  ).all();

  return new Response(JSON.stringify(result.results ?? []), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });
}
