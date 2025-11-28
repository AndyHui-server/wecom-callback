const express = require('express');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const crypto = require('crypto');

const TOKEN = process.env.WECOM_TOKEN || "你的Token";
const AES_KEY = process.env.WECOM_AESKEY || "你的EncodingAESKey";
const AES_KEY_BUFFER = Buffer.from(AES_KEY + "=", 'base64');

const app = express();
app.use(bodyParser.text({ type: 'text/xml' }));

// 企业微信验签函数
function checkSignature(token, timestamp, nonce, msg_encrypt) {
  const array = [token, timestamp, nonce, msg_encrypt].sort();
  const str = array.join('');
  const sha1 = crypto.createHash('sha1');
  sha1.update(str);
  return sha1.digest('hex');
}

// AES 解密
function decryptMsg(encrypt) {
  const aesCipher = crypto.createDecipheriv(
    'aes-256-cbc',
    AES_KEY_BUFFER,
    AES_KEY_BUFFER.slice(0, 16)
  );
  aesCipher.setAutoPadding(false);

  let decipheredBuff = Buffer.concat([
    aesCipher.update(encrypt, 'base64'),
    aesCipher.final()
  ]);

  const pad = decipheredBuff[decipheredBuff.length - 1];
  decipheredBuff = decipheredBuff.slice(0, decipheredBuff.length - pad);

  const content = decipheredBuff.slice(16);
  const msg_len = content.slice(0, 4).readUInt32BE(0);
  const xmlContent = content.slice(4, 4 + msg_len).toString('utf-8');

  return xmlContent;
}

// GET 验证服务器（企业微信第一次配置 URL 时用）
app.get('/', (req, res) => {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  const signature = checkSignature(TOKEN, timestamp, nonce, echostr);

  if (signature === msg_signature) {
    return res.send(echostr);
  } else {
    return res.status(401).send("Invalid signature");
  }
});

// POST 接收企业微信消息
app.post('/', async (req, res) => {
  try {
    const xmlData = await xml2js.parseStringPromise(req.body);
    const encrypt = xmlData.xml.Encrypt[0];

    const decryptedXML = decryptMsg(encrypt);
    const msg = await xml2js.parseStringPromise(decryptedXML);

    console.log("收到企业微信消息:", msg);

    // 企业微信要求必须快速返回 "success"
    res.send("success");
  } catch (e) {
    console.error("消息处理出错:", e);
    res.send("success");  
  }
});

// ❗不要 app.listen()
// Vercel 要求导出 app 作为处理函数
module.exports = app;
