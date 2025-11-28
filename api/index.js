import crypto from "crypto";

export default function handler(req, res) {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  const TOKEN = process.env.TOKEN;

  if (!msg_signature || !timestamp || !nonce || !echostr) {
    return res.status(400).send("Missing params");
  }

  // 企业微信签名校验
  const sign = [TOKEN, timestamp, nonce, echostr].sort().join("");
  const sha1 = crypto.createHash("sha1").update(sign).digest("hex");

  if (sha1 !== msg_signature) {
    return res.status(200).send("signature verification failed");
  }

  return res.status(200).send(echostr);
}
