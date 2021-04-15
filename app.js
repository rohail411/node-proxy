const express = require('express');
const morgan = require("morgan");
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const modifyResponse = require('node-http-proxy-json');
const { createLogs } = require('./controllers/logs');
const axios = require('axios');
const { user, crud } = require('./data');
const { createUserCred, getOneUserCred } = require('./controllers/user-credentials');
const {ztnAndEnpast, epsApp, updatePortalApp, esPortalApp, acmePortalApp, dtPortalApp} = require('./revbitsApp');
const {modifyBodyAcme,modifyBodyDt,modifyBodyEps,modifyBodyEs,modifyBodyUpdate,modifyBodyZtnAndEnpast} = require('./modifyResponseBody');
const { parseCookie } = require('./utils');
const app = express();

// app.use(express.json())

// Configuration
const API_SERVICE_URL = 'https://ztn.revbits.net';
const API_SERVICE_URL_2 = 'https://staging.ztn.revbits.net';
const API_SERVICE_URL_3 = 'https://enpast.com';
const API_SERVICE_URL_EPS = 'http://localhost:3000';


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
app.get('/proxy/:id',async(req,res,next)=>{
    const {id} = req.params;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const getProxy = await axios.post('https://ztn.revbits.net/api/v1/Proxy/GetOneProxyApp',
    {
        id:id
    },{headers:{'User-Agent':'ZTN Proxy Client'}});
    const proxyApp = getProxy.data.data;
    // const proxyApp = crud[id];
    if(proxyApp.slug==='ztn' || proxyApp.slug==='enpast'){
        return ztnAndEnpast(res,proxyApp);
    }
    else if(proxyApp.slug==='eps'){
        return epsApp(res,proxyApp)
    }
    else if(proxyApp.slug==='updatePortal'){
        return updatePortalApp(res,proxyApp);
    }
    else if(proxyApp.slug==='es'){
        return esPortalApp(res,proxyApp);
    }
    else if(proxyApp.slug==='acme'){
        return acmePortalApp(res,proxyApp);
    }
    else if(proxyApp.slug==='dt'){
        return dtPortalApp(res,proxyApp);   
    }
});


app.use('/eps',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await axios.post('https://eps.revbits.net/api/v1/login', { email: user.email, password: user.password });
    const createC = await createUserCred({credentials:response.data,siteName:'eps',targetUrl:'https://eps.revbits.net'});
    const cred = createC.toJSON();
    res.cookie('satellizer_token', response.data.token);
    res.cookie('proxy-user-id', cred.id);
    res.cookie('siteName', 'eps');
    res.cookie('targetUrl','https://eps.revbits.net');
    return res.redirect('/dashboard');
});

app.use('/updatePortal',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
   
        const response = await axios.post('https://update.revbits.com/api/v1/login', { email: 'abdullah.zafar@invozone.com', password: 'd6334f4ea8bfde94a90390d6f5dce59f8c69244d4827e64486ceabefd69fd59b3e0e29a23748e1f26dec7f22c796bb110837480c35cc32c67e289cbf823816f6' });
        res.cookie('token', response.data.response.token);
        res.cookie('siteName', 'updatePortal');
        res.cookie('targetUrl','https://update.revbits.com');
    
    const createC = await createUserCred({credentials:response.data.response,siteName:'updatePortal',targetUrl:'https://update.revbits.com'});
    const cred = createC.toJSON();
    res.cookie('proxy-user-id',cred.id);
    return res.redirect('/software');
});

app.use('/dt',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
   
    const response = await axios.post('https://dt.revbits.net/api/v1/login', { email: 'rohail.butt@invozone.com', password: 'b7d4e49a3fd7f9b1eec6088188baf30a76c2a20ec102f4c82d2f5abe3fa88c544497d05c31abd1cceae1ac8f44916b225ef04ed911f0fea0c903ed71cd018e30' });
    res.cookie('token', response.data.token);
    res.cookie('siteName', 'dt');
    res.cookie('targetUrl','https://dt.revbits.net');
    
    const createC = await createUserCred({credentials:response.data,siteName:'dt',targetUrl:'https://dt.revbits.net'});
    const cred = createC.toJSON();
    res.cookie('proxy-user-id',cred.id);
    return res.redirect('/dashboard');
});



app.use('/acme',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await axios.post('https://acme.pentest.revbits.com/api/v1/login', { email: 'rohail.butt@invozone.com', password: 'b7d4e49a3fd7f9b1eec6088188baf30a76c2a20ec102f4c82d2f5abe3fa88c544497d05c31abd1cceae1ac8f44916b225ef04ed911f0fea0c903ed71cd018e30' });
    res.cookie('authToken', response.data.response.token);
    res.cookie('_pportalref', response.data.response.token);
    res.cookie('_clientpk',response.data.response.userData.publicKey)
    res.cookie('siteName', 'acme');
    res.cookie('targetUrl','https://acme.pentest.revbits.com');
    return res.redirect('/');
});


app.use('/ztn',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await axios.post(API_SERVICE_URL_2+'/api/v1/Login', { ...crud[1].credentials }, { headers: { Accept: 'application/json', 'User-Agent': 'ZTN Desktop Client' } });
    // return res.json({data:response.data.data});
    res.cookie('JWT_TOKEN', response.data.data.token);
    res.cookie('CURRENT_USER_ID', response.data.data.userid);
    res.cookie('USER_SETTINGS', `${response.data.data.user_settings}`);
    res.cookie('CURRENT_USER_PERM',response.data.data.permissions)
    res.cookie('siteName', 'ztn');
    res.cookie('targetUrl',API_SERVICE_URL_2);
    return res.redirect('/');
})   
app.use('/enpast',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await axios.post(API_SERVICE_URL_3+'/api/v1/Login', { email: 'admin@admin.com', password: '1c5d28e194c48d0581823cba37625536dd5f323c541bc45ada6369c7b25200d0123740a6f352618603623d8c2092dfb8e23b9ed8f0da3a93d98578b86408001e' }, { headers: { Accept: 'application/json', 'User-Agent': 'ENPAST Desktop Client' } });
    res.cookie('JWT_TOKEN', response.data.data.token);
    res.cookie('CURRENT_USER_ID', response.data.data.userid);
    res.cookie('USER_SETTINGS', `${response.data.data.user_settings}`);
    res.cookie('CURRENT_USER_PERM',response.data.data.permissions)
    res.cookie('siteName', 'enpast');
    res.cookie('targetUrl',API_SERVICE_URL_3);
    return res.redirect('/');
});

app.use('/es',async (req, res, next) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const response = await axios.post('https://es.revbits.com/api/v2/auth/login', {
        "email": "abdullah.zafar+1@invozone.com",
        "password":"ddb84f2fa212d098ba2133516583a83ad83127f4c9ab3fc5dad73b99b97cea38221866fba73aa707aa57eae2ed0ef197407d467fcb6496211cf9c77d2b5b2c88"
    });
    res.cookie('userData',{...response.data.response.userData,sessiontoken:response.data.response.token});
    res.cookie('roles',response.data.response.userData.roles);
    res.cookie('permissions',response.data.response.userData.permissions);
    res.cookie('siteName','es');
    res.cookie('targetUrl','https://es.revbits.com');
    return res.redirect('/');
});


// Proxy endpoints
app.use('*',async (req, res, next) => {
  
    req.site = req.cookies['siteName'];
    req.targetUrl = req.cookies['targetUrl'];
    next();
}, createProxyMiddleware({
    target: API_SERVICE_URL_EPS,
    changeOrigin: true,
    secure: false,
    ws: true,
    logLevel: 'debug',
    pathRewrite: {
    },
    
    router: (_req) => {
        if(_req.url.startsWith('/socket.io/?')){
            const cookie = parseCookie(_req.headers['cookie']);
            const a =  `wss://${cookie['targetUrl'].split('://')[1]}`;
            if(cookie['siteName']==='acme'){
                return cookie['targetUrl'];
            }
            else return a; 
        }
        if (_req.site) {
            return _req.targetUrl;
        }
        
    },
    onProxyReq(proxyReq, req, res) {
        if(req.site==='ztn'){
            proxyReq.setHeader('User-Agent','ZTN Desktop Client');
        }
        if(req.site==='enpast'){
            proxyReq.setHeader('User-Agent','ENPAST Desktop Client');
        }
        if(req.site==='eps' ){
            proxyReq.setHeader('Authorization',`Bearer ${req.cookies['satellizer_token']}`)
        }
        if(req.site==='acme' ){
            proxyReq.setHeader('Authorization',`Bearer ${req.cookies['authToken']}`)
        }
        if (req.url.startsWith('/api')) {
            createLogs(req);
        }
    },
    onProxyRes(proxyRes, req, res) {
        delete proxyRes.headers['content-length'];
        modifyResponse(res, proxyRes.headers['content-encoding'], function (body) {
            if(req.site==='ztn' || req.site==='enpast') return modifyBodyZtnAndEnpast(req,body);
            if(req.site==='updatePortal') return modifyBodyUpdate(req,body);
            if(req.site==='eps') return modifyBodyEps(req,body);
            if(req.site==='dt') return modifyBodyDt(req,body);
            if(req.site==='acme') return modifyBodyAcme(req,body);
            if(req.site==='es') return modifyBodyEs(req,body);
          });
    },
   
}));

module.exports.app = app;

