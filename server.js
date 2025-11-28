import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// 企业微信回调接口
app.post('/callback', (req, res) => {
    console.log('WeCom Callback:', req.body);

    // 测试返回
    res.json({
        code: 0,
        msg: "received",
        echo: req.body
    });
});

// 默认首页
app.get('/', (req, res) => {
    res.send("WeCom Callback Running on Vercel!");
});

// 端口：Vercel 会自动管理，不能手动指定
export default app;
