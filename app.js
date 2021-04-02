const express = require('express');
const morgan = require("morgan");
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const modifyResponse = require('node-http-proxy-json');
const { createLogs } = require('./controllers/logs');
const axios = require('axios');
const { user } = require('./data');
const app = express();

// app.use(express.json())

// Configuration
const API_SERVICE_URL = 'https://ztn.revbits.net';
const API_SERVICE_URL_2 = 'https://staging.ztn.revbits.net';
const API_SERVICE_URL_3 = 'https://enpast.com';


// Logging
app.use(morgan('dev'));
// Routes
const logsRoutes = require('./routes/logs')(express.Router());

// Info GET endpoint
app.use(cookieParser());

app.get('/app.html', async (req, res) => {
    return res.sendFile(path.join(__dirname, '/index.html'));
})

app.use('/myApi', logsRoutes);

app.use('/ztn',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await axios.post(API_SERVICE_URL_2+'/api/v1/Login', { email: user.email, password: user.password }, { headers: { Accept: 'application/json', 'User-Agent': 'ZTN Desktop Client' } });
    res.cookie('JWT_TOKEN', response.data.data.token);
    res.cookie('CURRENT_USER_ID', response.data.data.userid);
    res.cookie('USER_SETTINGS', `${response.data.data.user_settings}`);
    res.cookie('CURRENT_USER_PERM',response.data.data.permissions)
    res.cookie('siteName', 'ztn');
    return res.redirect('/');
})   
app.use('/enpast',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await axios.post(API_SERVICE_URL_3+'/api/v1/Login', { email: 'admin@admin.com', password: user.password }, { headers: { Accept: 'application/json', 'User-Agent': 'ENPAST Desktop Client' } });
    res.cookie('JWT_TOKEN', response.data.data.token);
    res.cookie('CURRENT_USER_ID', response.data.data.userid);
    res.cookie('USER_SETTINGS', `${response.data.data.user_settings}`);
    res.cookie('CURRENT_USER_PERM',response.data.data.permissions)
    res.cookie('siteName', 'enpast');
    return res.redirect('/');
})  

function modifyBody(req,body){
    let service_url = '';
    let socket_url = ''
    if(req.site==='ztn'){
        service_url = API_SERVICE_URL_2;
        socket_url = API_SERVICE_URL_2.split('https://')[1]
    }
    else if(req.site==='enpast'){
        service_url = API_SERVICE_URL_3;
        socket_url = API_SERVICE_URL_3.split('https://')[1]
    }
    if (body && typeof body === "string") {
        body = body.split('https://"+location.hostname+"').join(process.env.PROXY_URL)
        body = body.split(`location.protocol+"//"+location.hostname`).join(`"${process.env.PROXY_URL}"`);
        body = body.split(`o.a.BASE_URL`).join(`"${service_url}"`);
        body = body.split(`a.a.BASE_URL`).join(`"${service_url}"`);
        body = body.split('"wss://"+location.hostname+":8080"').join(`"wss://${socket_url}:8080"`);
        if (body.includes('<!--CIP-SCRIPT-HERE-->')) {
            const dynamicScript = `<script type="text/javascript">
            sessionStorage.setItem('JWT_TOKEN','${req.cookies['JWT_TOKEN']}');
            sessionStorage.setItem('CURRENT_USER_ID','${req.cookies['CURRENT_USER_ID']}');
            sessionStorage.setItem('USER_SETTINGS','${req.cookies['USER_SETTINGS']}');
            sessionStorage.setItem('CURRENT_USER_PERM','${req.cookies['CURRENT_USER_PERM']}');
            </script>`;
            body = body.replace('<!--CIP-SCRIPT-HERE-->', dynamicScript);

        }

    }
    return body;
}
// Proxy endpoints
app.use('*',async (req, res, next) => {
    req.site = req.cookies['siteName'];
    next();
}, createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    ws: true,
    logLevel: 'debug',
    pathRewrite: {
    },
    
    router: (_req) => {
        if (_req.site === 'ztn') {
            return API_SERVICE_URL_2;
        }
        else if (_req.site === 'enpast') {
            return API_SERVICE_URL_3;
        }
    },
    onProxyReq(proxyReq, req, res) {
        if(req.site==='ztn'){
            proxyReq.setHeader('User-Agent','ZTN Desktop Client');
        }
        if(req.site==='enpast'){
            proxyReq.setHeader('User-Agent','ENPAST Desktop Client');
        }
        if (req.url.startsWith('/api')) {
            createLogs(req);
        }
    },
    onProxyRes(proxyRes, req, res) {
        delete proxyRes.headers['content-length'];
        modifyResponse(res, proxyRes.headers['content-encoding'], function (body) {
            return modifyBody(req,body);
          });
    },
   
}));

module.exports.app = app;

