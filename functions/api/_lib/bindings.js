export function getDatabaseBinding(env = {}) {
  return env.USER_DB || env.DB || env.ABDULL_DB || null;
}

export function getKvBinding(env = {}) {
  return env.KV || env.ABDULL_KV || null;
}

export function getR2BucketBinding(env = {}) {
  return env.R2_BUCKET || env.R || env.ABDULL_BUCKET || null;
}

export function getBindingStatus(env = {}) {
  return {
    analytics: Boolean(env.ANALYTICS),
    d1: Boolean(getDatabaseBinding(env)),
    kv: Boolean(getKvBinding(env)),
    r2: Boolean(getR2BucketBinding(env)),
  };
}
