import { getR2BucketBinding } from './_lib/bindings.js';

export async function onRequest({ env, request }) {
  const bucket = getR2BucketBinding(env);

  if (!bucket) {
    return new Response("R2 binding not configured", { status: 500 });
  }

  if (request.method === "POST") {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") || `statement-${Date.now()}.csv`;
    await bucket.put(key, request.body, {
      httpMetadata: {
        contentType: request.headers.get("content-type") || "text/csv",
      },
    });
    return new Response(JSON.stringify({ key }), {
      status: 201,
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  }

  const listed = await bucket.list({ limit: 100 });
  return new Response(JSON.stringify(listed.objects ?? []), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });
}
