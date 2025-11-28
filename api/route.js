import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const msg_signature = searchParams.get("msg_signature");
  const timestamp = searchParams.get("timestamp");
  const nonce = searchParams.get("nonce");
  const echostr = searchParams.get("echostr");

  const TOKEN = process.env.TOKEN;
  const AES_KEY = process.env.AES_KEY;

  if (!msg_signature || !timestamp || !nonce || !echostr) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // 企业微信签名 = sha1(sort(TOKEN, timestamp, nonce, echostr).join(''))
  const params = [TOKEN, timestamp, nonce, echostr].sort().join('');
  const sha1 = crypto.createHash('sha1').update(params).digest('hex');

  if (sha1 !== msg_signature) {
    return new Response("signature verification failed", { status: 200 });
  }

  // 验证成功必须原样返回 echostr
  return new Response(echostr, { status: 200 });
}

export async function POST(req) {
  return NextResponse.json({ msg: "POST receive" });
}
