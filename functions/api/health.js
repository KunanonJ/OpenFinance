export async function onRequest({ env }) {
  const bindings = {
    kv: Boolean(env.ABDULL_KV),
    d1: Boolean(env.ABDULL_DB),
    r2: Boolean(env.ABDULL_BUCKET),
  };

  return new Response(
    JSON.stringify({
      status: "ok",
      bindings,
    }),
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    }
  );
}
