import crypto from "crypto";
import { parseString } from "xml2js";

const TOKEN = process.env.TOKEN;
const AES_KEY = process.env.AES_KEY; // base64 key
const AES_KEY_BUFFER = Buffer.from(AES_KEY + "=", "base64");
const IV = AES_KEY_BUFFER.subarray(0, 16);

// AES 解密
function decryptMsg(msg_encrypt) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", AES_KEY_BUFFER, IV);
  decipher.setAutoPadding(false);
  let decrypted = Buffer.concat([
    decipher.update(msg_encrypt, "base64"),
    decipher.final(),
  ]);

  const pad = decrypted[decrypted.length - 1];
  decrypted = decrypted.subarray(0, decrypted.length - pad);

  const contentLength = decrypted.readUInt32BE(16);
  return decrypted.subarray(20, 20 + contentLength).toString();
}

export default function handler(req, res) {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  // 🔥 1. 企业微信 URL 验证（GET）
  if (req.method === "GET") {
    const signature = crypto
      .createHash("sha1")
      .update([TOKEN, timestamp, nonce, echostr].sort().join(""))
      .digest("hex");

    if (signature === msg_signature) {
      console.log("企业微信验证成功");
      return res.send(echostr); // 必须原样返回
    } else {
      console.log("企业微信验证失败");
      return res.status(400).send("验证失败");
    }
  }

  // 🔥 2. 消息回调（POST）
  if (req.method === "POST") {
    let xml = "";
    req.on("data", (chunk) => (xml += chunk));
    req.on("end", () => {
      parseString(xml, (err, result) => {
        if (err) return res.status(400).send("xml parse error");

        const encrypt = result.xml.Encrypt[0];
        const decrypted = decryptMsg(encrypt);

        console.log("收到消息：", decrypted);

        // 你可以在这里写自动回复逻辑…

        return res.send("success");
      });
    });

    return;
  }

  res.status(405).send("Method Not Allowed");
}
