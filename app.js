const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const modifyResponse = require('node-http-proxy-json');
const { createLogs } = require('./controllers/logs');
const { crud } = require('./data');
const {
    ztnAndEnpast,
    epsApp,
    updatePortalApp,
    esPortalApp,
    acmePortalApp,
    dtPortalApp
} = require('./revbitsApp');
const {
    modifyBodyAcme,
    modifyBodyDt,
    modifyBodyEps,
    modifyBodyEs,
    modifyBodyUpdate,
    modifyBodyZtnAndEnpast,
    modifyBodyIn,
    modifyBodyTw,
    modifyProxyResTw,
    modifyBodyLi,
    modifyProxyResLi,
    modifyProxyResIn,
    modifyProxyResFa
} = require('./modifyResponseBody');
const { parseCookie } = require('./utils');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { linkedinApp, twitterApp, instagramApp } = require('./otherApps');
const app = express();

// app.use(express.json())

// Configuration
const API_SERVICE_URL_EPS = 'https://twitter.com';

app.use(cors());
// Logging
app.use(morgan('dev'));
// Routes
const logsRoutes = require('./routes/logs')(express.Router());

// Info GET endpoint
app.use(cookieParser());

app.get('/app.html', async (req, res) => {
    return res.sendFile(path.join(__dirname, '/index.html'));
});

app.use('/myApi', logsRoutes);
app.get('/proxy/:id', async (req, res, next) => {
    const { id } = req.params;
    const { authToken } = req.query;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    // const getProxy = await axios.post('https://ztn.revbits.net/api/v1/Proxy/GetOneProxyApp',
    // {
    //     id:id
    // },{headers:{'User-Agent':'ZTN Proxy Client'}});
    // const proxyApp = getProxy.data.data;
    const proxyApp = crud[id];
    proxyApp.user = jwt.decode(authToken);

    switch (proxyApp.slug) {
        case 'ztn':
        case 'enpast':
            return ztnAndEnpast(res, proxyApp);
        case 'eps':
            return epsApp(res, proxyApp);
        case 'es':
            return esPortalApp(res, proxyApp);
        case 'updatePortal':
            return updatePortalApp(res, proxyApp);
        case 'acme':
            return acmePortalApp(res, proxyApp);
        case 'dt':
            return dtPortalApp(res, proxyApp);
        case 'linkedin':
            return linkedinApp(res, proxyApp);
        case 'twitter':
            return twitterApp(res, proxyApp);
        case 'instagram':
            return instagramApp(res, proxyApp);
        default:
            break;
    }
});

// Proxy endpoints
app.use(
    '*',
    async (req, res, next) => {
        req.site = req.cookies['siteName'];
        req.targetUrl = req.cookies['targetUrl'];
        next();
    },
    createProxyMiddleware({
        target: API_SERVICE_URL_EPS,
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        pathRewrite: {},

        router: (_req) => {
            if (_req.url.startsWith('/socket.io/?')) {
                const cookie = parseCookie(_req.headers['cookie']);
                const a = `wss://${cookie['targetUrl'].split('://')[1]}`;
                if (cookie['siteName'] === 'acme') {
                    return cookie['targetUrl'];
                } else return a;
            }

            if (_req.url.startsWith('/v3')) {
                return 'https://static.xx.fbcdn.net/rsrc.php';
            }
            //Twitter stuff
            if (_req.url.startsWith('/responsive')) {
                return 'https://abs.twimg.com';
            }
            if (_req.url.startsWith('/1.1')) {
                return 'https://api.twitter.com';
            }
            if (_req.url.startsWith('/sc')) {
                return 'https://static-exp1.licdn.com';
            }
            //END
            //Instagram
            if (_req.url.startsWith('/api') && _req.site === 'instagram') {
                return 'https://i.instagram.com';
            }
            if (_req.url.startsWith('/?returnUrl=')) {
                return 'https://' + _req.url.split('/?returnUrl=')[1];
            }
            //END
            // Facebook
            if (_req.url.startsWith('/mqtt/pull')) {
                return 'https://edge-chat.facebook.com';
            }
            //END
            if (_req.site) {
                return _req.targetUrl;
            }
        },
        onProxyReq(proxyReq, req, res) {
            if (req.site === 'ztn') {
                proxyReq.setHeader('User-Agent', 'ZTN Desktop Client');
            }
            if (req.site === 'enpast') {
                proxyReq.setHeader('User-Agent', 'ENPAST Desktop Client');
            }
            if (req.site === 'eps') {
                proxyReq.setHeader('Authorization', `Bearer ${req.cookies['satellizer_token']}`);
            }
            if (req.site === 'acme') {
                proxyReq.setHeader('Authorization', `Bearer ${req.cookies['authToken']}`);
            }
            if (req.url.includes('/api')) {
                createLogs(req);
            }
        },
        onProxyRes(proxyRes, req, res) {
            delete proxyRes.headers['content-length'];
            switch (req.site) {
                case 'linkedin':
                    modifyProxyResLi(proxyRes);
                    break;
                case 'twitter':
                    modifyProxyResTw(proxyRes);
                    break;
                case 'instagram':
                    modifyProxyResIn(proxyRes);
                    break;
                case 'facebook':
                    modifyProxyResFa(proxyRes);
                    break;
                default:
                    break;
            }

            modifyResponse(res, proxyRes.headers['content-encoding'], function (body) {
                switch (req.site) {
                    case 'ztn':
                    case 'enpast':
                        return modifyBodyZtnAndEnpast(req, body);
                    case 'eps':
                        return modifyBodyEps(req, body);
                    case 'dt':
                        return modifyBodyDt(req, body);
                    case 'acme':
                        return modifyBodyAcme(req, body);
                    case 'updatePortal':
                        return modifyBodyUpdate(req, body);
                    case 'es':
                        return modifyBodyEs(req, body);
                    case 'linkedin':
                        return modifyBodyLi(body);
                    case 'twitter':
                        return modifyBodyTw(body);
                    case 'instagram':
                    case 'facebook':
                        return modifyBodyIn(body);
                    default:
                        break;
                }
            });
        }
    })
);

module.exports.app = app;
