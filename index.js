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
const PORT = 3000;
const HOST = "localhost";
const API_SERVICE_URL = 'https://ztn.revbits.net';
const API_SERVICE_URL_2 = 'https://staging.ztn.revbits.net';

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
    const response = await axios.post(API_SERVICE_URL+'/api/v1/Login', { email: user.email, password: user.password }, { headers: { Accept: 'application/json', 'User-Agent': 'ZTN Proxy Client' } });
    res.cookie('JWT_TOKEN', response.data.data.token);
    res.cookie('CURRENT_USER_ID', response.data.data.userid);
    res.cookie('USER_SETTINGS', `${response.data.data.user_settings}`);
    res.cookie('CURRENT_USER_PERM',response.data.data.permissions)
    res.cookie('siteName', 'ztn');
    return res.redirect('/');
})   

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
    headers: {
        'User-Agent':'ZTN Proxy Client'
    },
    // router: {
    //     'localhost:3000/https': API_SERVICE_URL_2+':443',
    //     "localhost:3000/socket": API_SERVICE_URL_2+':8080'
    // },
    router: (_req) => {
        if (_req.site === 'ztn') {
            return API_SERVICE_URL;
        }
        // else if (_req.url === '/https') {
        //     return API_SERVICE_URL + ':443';
        // }
        // else if (_req.url === '/socket') {
        //     return API_SERVICE_URL + ':8080';
        // }
        
    },
    onProxyReq(proxyReq, req, res) {
        if (req.url.startsWith('/api')) {
            createLogs(req);
        }
    },
    onProxyRes(proxyRes, req, res) {
        delete proxyRes.headers['content-length'];
        modifyResponse(res, proxyRes.headers['content-encoding'], function (body) {
            if (body && typeof body === "string") {
                const dynamicScript = `<script type="text/javascript">
                sessionStorage.setItem('JWT_TOKEN','${req.cookies['JWT_TOKEN']}');
                sessionStorage.setItem('CURRENT_USER_ID','${req.cookies['CURRENT_USER_ID']}');
                sessionStorage.setItem('USER_SETTINGS','${req.cookies['USER_SETTINGS']}');
                sessionStorage.setItem('CURRENT_USER_PERM','${req.cookies['CURRENT_USER_PERM']}');
                </script>`;
                //http://localhost:3000:443
                body = body.split('https://"+location.hostname+"').join('http://localhost:3000')
                body = body.split(`location.protocol+"//"+location.hostname`).join('"http://localhost:3000"');
                body = body.split(`o.a.BASE_URL`).join('"https://ztn.revbits.net"');
                // body = body.split(`location.protocol+"//"+location.hostname:8080`).join('http://localhost:3000/socket');
                body = body.split('"wss://"+location.hostname+":8080"').join('"wss://ztn.revbits.net:8080"');
                if (body.includes('<!--CIP-SCRIPT-HERE-->')) {
                    body = body.replace('<!--CIP-SCRIPT-HERE-->', dynamicScript);

                }

            }
            return body;
          });
    },
   
}));
 
// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
 });
