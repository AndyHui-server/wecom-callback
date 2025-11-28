import crypto from "crypto";

export default function handler(req, res) {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  const TOKEN = process.env.TOKEN;

  // 生成正确的签名
  const tmpArr = [TOKEN, timestamp, nonce, echostr].sort();
  const sha1 = crypto.createHash("sha1");
  sha1.update(tmpArr.join(""));
  const signature = sha1.digest("hex");

  console.log("== Signature Check ==");
  console.log("TOKEN=", TOKEN);
  console.log("Params =>", { msg_signature, timestamp, nonce, echostr });
  console.log("Local signature=", signature);

  // 校验
  if (signature === msg_signature) {
    console.log("Signature valid.");
    return res.status(200).send(echostr);
  } else {
    console.log("Signature invalid!");
    return res.status(200).send("signature verification failed");
  }
}
