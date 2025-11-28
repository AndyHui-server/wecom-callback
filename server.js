import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.text({ type: "*/*" }));

const TOKEN = process.env.TOKEN || "替换你的TOKEN";
const AES_KEY = process.env.AES_KEY || "替换你的AESKEY";

// --- 企业微信验证 ---
app.get("/", (req, res) => {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  const signature = crypto
    .createHash("sha1")
    .update([TOKEN, timestamp, nonce, echostr].sort().join(""))
    .digest("hex");

  if (signature === msg_signature) {
    res.send(echostr);
  } else {
    res.status(401).send("signature verification failed");
  }
});

// --- 正式消息回调入口（可先记录日志）---
app.post("/", (req, res) => {
  console.log("Received message:", req.body);
  res.send("success");
});

// 监听端口（Vercel 会自动处理）
export default app;
