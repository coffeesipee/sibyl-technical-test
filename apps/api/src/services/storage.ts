import { createClient } from '@supabase/supabase-js';
import { env } from '../env';
import crypto from 'crypto';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export async function uploadBuffer({
  buffer,
  contentType,
  keyPrefix,
}: {
  buffer: Buffer;
  contentType: string;
  keyPrefix: string;
}) {
  const key = `${keyPrefix}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const { error } = await supabase.storage.from(env.SUPABASE_BUCKET).upload(key, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return { key };
}

export async function getSignedDownloadUrl(key: string) {
  const { data, error } = await supabase.storage.from(env.SUPABASE_BUCKET).createSignedUrl(key, env.SUPABASE_SIGNED_URL_TTL_SECONDS, {
    download: true
  });
  if (error) throw error;
  return data.signedUrl;
}
