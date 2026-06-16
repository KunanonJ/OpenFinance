import { getKvBinding } from './_lib/bindings.js';

export async function onRequest({ env, request }) {
  const kv = getKvBinding(env);

  if (!kv) {
    return new Response("KV binding not configured", { status: 500 });
  }

  if (request.method === "POST") {
    const payload = await request.json();
    const key = payload?.key;
    if (!key) {
      return new Response("Missing key", { status: 400 });
    }
    await kv.put(key, JSON.stringify(payload.value ?? null));
    return new Response("stored", { status: 201 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) {
    return new Response("Missing key", { status: 400 });
  }
  const value = await kv.get(key);
  return new Response(value ?? "null", {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });
}
