const express = require('express');
const morgan = require("morgan");
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const HOST = "localhost";
// const API_SERVICE_URL = "https://jsonplaceholder.typicode.com";
const API_SERVICE_URL = 'https://ztn.revbits.net:4200'
// Logging
app.use(morgan('dev'));

// Info GET endpoint

// Authorization
app.use('', (req, res, next) => {
    if (req.headers.authorization) {
        next();
    } else {
        next();
        // res.sendStatus(403);
    }
});
 
const apiProxy = createProxyMiddleware('/api',{
    target: 'https://ztn.revbits.net',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/api/v1/Login':'/api/v1/Login'
    },
    headers: {
        'JwtAuth':'JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5ODAwZTk0LTVhY2MtNDU0ZC1iZDY4LTgzYWFkN2I5YWY5MiIsImVtYWlsSWQiOiJhZG1pbkB6dG4uY29tIiwiaWF0IjoxNjE1ODEwNTE4LCJleHAiOjE2MTU4MTc3MTh9.CHihchi6hLKcvx5dSB_Lzx3VCQhJ0rL5hMo5anz6xVftYj9GokBWtVnyAx5kAS-X_0Tu3A-l15s86dITydBwYuSapGgZLK2eTHSgq-kFyqWbaojvvHWXkVKLgY6K0QfMoubFcpxCYeMPsXWZwNgw18tciRpAgdQ4CHaQ-S1aIRLwYijk_5_-5lLzLGeAKumcX0sHPMpkmsCtMs_deLG9nI9C771KlOnhzFGZwN7LJ13nAeWxNKY4qmpbfBZGtl2wU6_4Jvcsg9N0MkDa44_jAh2zWBsSTAFn8UPjhmjt57ptj6DffTg6ZoKBjccmpfHCqlWHYi4g9d8i-T8THh4swX8HmVux2asK8qTjX8a9b9UpGmsf5lGP1ZHPXQGO2g2LObY5hnPHFaYQsRzLtyJAebihMwgzJM5TwwNCDe3mOnxG4mc-HdxCwlGGF3XWM8xbO8vedFA49RN7HndEMkz1WcmLzCUo7WHxPkUHHjmsjnPQDY3Y48ESVk2n9ye-PF-kyIXquc6zwDwm32Sm7Tx2qLd39Ub6AGJTQcUU5jQk1kgY7wLySO0BmaFTHVtoE0kvWFDF11AIFtrBTBKvmUMdQHVTiGFtHW-86s7DYayD2wPgcQJnm9Qe-vF3w0D1KUXwgU3iLsTOk9rPbo7Baz2gAsJcj3yi7ZLsy1OwHuCiK1A'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('URL', req.url);
    }   
});
app.use(apiProxy);

// Proxy endpoints
app.use('*', (req, res, next) => {
    req.header('host', 'https://ztn.revbits.net');
    next();
}, createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    secure:false,
    pathRewrite: {
        '^/api': '/api/v1/Login',
        '^/posts':'/posts',
    },
    headers: {
        'JwtAuth':'JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg5ODAwZTk0LTVhY2MtNDU0ZC1iZDY4LTgzYWFkN2I5YWY5MiIsImVtYWlsSWQiOiJhZG1pbkB6dG4uY29tIiwiaWF0IjoxNjE1ODEwNTE4LCJleHAiOjE2MTU4MTc3MTh9.CHihchi6hLKcvx5dSB_Lzx3VCQhJ0rL5hMo5anz6xVftYj9GokBWtVnyAx5kAS-X_0Tu3A-l15s86dITydBwYuSapGgZLK2eTHSgq-kFyqWbaojvvHWXkVKLgY6K0QfMoubFcpxCYeMPsXWZwNgw18tciRpAgdQ4CHaQ-S1aIRLwYijk_5_-5lLzLGeAKumcX0sHPMpkmsCtMs_deLG9nI9C771KlOnhzFGZwN7LJ13nAeWxNKY4qmpbfBZGtl2wU6_4Jvcsg9N0MkDa44_jAh2zWBsSTAFn8UPjhmjt57ptj6DffTg6ZoKBjccmpfHCqlWHYi4g9d8i-T8THh4swX8HmVux2asK8qTjX8a9b9UpGmsf5lGP1ZHPXQGO2g2LObY5hnPHFaYQsRzLtyJAebihMwgzJM5TwwNCDe3mOnxG4mc-HdxCwlGGF3XWM8xbO8vedFA49RN7HndEMkz1WcmLzCUo7WHxPkUHHjmsjnPQDY3Y48ESVk2n9ye-PF-kyIXquc6zwDwm32Sm7Tx2qLd39Ub6AGJTQcUU5jQk1kgY7wLySO0BmaFTHVtoE0kvWFDF11AIFtrBTBKvmUMdQHVTiGFtHW-86s7DYayD2wPgcQJnm9Qe-vF3w0D1KUXwgU3iLsTOk9rPbo7Baz2gAsJcj3yi7ZLsy1OwHuCiK1A'
        },
    router: {
        // when request.headers.host == 'dev.localhost:3000',
        // override target 'http://www.example.org' to 'http://localhost:8000'
        'https://ztn.revbits.net': 'http://localhost:3000'
    },
   
}));
 
// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
 });
