import { getBindingStatus } from './_lib/bindings.js';

export async function onRequest({ env }) {
  const bindings = getBindingStatus(env);

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
