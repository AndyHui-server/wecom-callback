export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  const url = new URL(request.url);

  const msg_signature = url.searchParams.get("msg_signature");
  const timestamp = url.searchParams.get("timestamp");
  const nonce = url.searchParams.get("nonce");
  const echostr = url.searchParams.get("echostr");

  // 你自己的 TOKEN
  const TOKEN = process.env.TOKEN;

  // 企业微信验证规则：signature = sha1(sort(TOKEN, timestamp, nonce, echostr))
  const raw = [TOKEN, timestamp, nonce, echostr].sort().join('');
  const signature = await sha1(raw);

  if (signature !== msg_signature) {
    return new Response('signature invalid', { status: 401 });
  }

  return new Response(echostr, { status: 200 });
}

// Edge 环境内置 SubtleCrypto
async function sha1(text) {
  const buffer = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-1", buffer);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
