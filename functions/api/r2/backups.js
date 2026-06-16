/**
 * GET /api/r2/backups - List all historical backups
 */

export async function onRequestGet(context) {
  const { env, data } = context;
  const bucket = data.r2Bucket || env.R2_BUCKET;
  const prefix = data.userPrefix;
  const url = new URL(context.request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  const listed = await bucket.list({
    prefix: `${prefix}/data/backups/`,
    limit,
  });

  const backups = listed.objects.map(obj => ({
    key: obj.key,
    uploaded: obj.uploaded.toISOString(),
    size: obj.size,
    customMetadata: obj.customMetadata || {},
  }));

  // Sort newest first
  backups.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

  return new Response(JSON.stringify(backups), {
    headers: { "Content-Type": "application/json" },
  });
}
