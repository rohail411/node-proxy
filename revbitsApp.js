const axios = require('axios');
const { createUserCred } = require('./controllers/user-credentials');

const ztnAndEnpast = async(res,proxyApp) =>{
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
        const response = await axios.post(proxyApp.targetUrl+'/api/v1/Login', { ...proxyApp.credentials }, { headers: { Accept: 'application/json', 'User-Agent': proxyApp.slug==='ztn'?'ZTN Desktop Client' :'ENPAST Desktop Client' } });
        res.cookie('JWT_TOKEN', response.data.data.token);
        res.cookie('CURRENT_USER_ID', response.data.data.userid);
        res.cookie('USER_SETTINGS', `${response.data.data.user_settings}`);
        res.cookie('CURRENT_USER_PERM',response.data.data.permissions)
        res.cookie('siteName', proxyApp.slug);
        res.cookie('targetUrl',proxyApp.targetUrl);
        return res.redirect('/');
    } catch (error) {
        return res.json({error:'Something went wrong try again later'});
    }
}

const epsApp = async (res,proxyApp) =>{
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
        const response = await axios.post(proxyApp.targetUrl+'/api/v1/login', { ...proxyApp.credentials });
        const createC = await createUserCred({credentials:response.data,siteName:proxyApp.slug,targetUrl:proxyApp.targetUrl});
        const cred = createC.toJSON();
        res.cookie('satellizer_token', response.data.token);
        res.cookie('proxy-user-id', cred.id);
        res.cookie('siteName', 'eps');
        res.cookie('targetUrl',proxyApp.targetUrl);
        return res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
        return res.json({error:'Something went wrong try again later'});
        
    }
}

const updatePortalApp = async (res,proxyApp) =>{
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
   
    try {
        const response = await axios.post(proxyApp.targetUrl+'/api/v1/login', { email: 'abdullah.zafar@invozone.com', password: 'd6334f4ea8bfde94a90390d6f5dce59f8c69244d4827e64486ceabefd69fd59b3e0e29a23748e1f26dec7f22c796bb110837480c35cc32c67e289cbf823816f6' });
        res.cookie('token', response.data.response.token);
        res.cookie('siteName', 'updatePortal');
        res.cookie('targetUrl',proxyApp.targetUrl);
        
        const createC = await createUserCred({credentials:response.data.response,siteName:proxyApp.slug,targetUrl:proxyApp.targetUrl});
        const cred = createC.toJSON();
        res.cookie('proxy-user-id',cred.id);
        return res.redirect('/software');
    } catch (error) {
        return res.json({error:'Something went wrong try again later'});
          
    }
}

const acmePortalApp = async (res,proxyApp) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
        const response = await axios.post(proxyApp.targetUrl+'/api/v1/login', { ...proxyApp.credentials});
        console.log(response.data);
    res.cookie('authToken', response.data.response.token);
    res.cookie('_clientpk',response.data.response.userData.publicKey);
    res.cookie('siteName', proxyApp.slug);
    res.cookie('targetUrl',proxyApp.targetUrl);
    return res.redirect('/');
    } catch (error) {
        return res.json({error:'Something went wrong try again later'});
        
    }
}

const dtPortalApp = async (res,proxyApp) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
   
    try {
        const response = await axios.post(proxyApp.targetUrl+'/api/v1/login', {...proxyApp.credentials});
    res.cookie('token', response.data.token);
    res.cookie('siteName', proxyApp.slug);
    res.cookie('targetUrl',proxyApp.targetUrl);
    
    const createC = await createUserCred({credentials:response.data,siteName:'dt',targetUrl:'https://dt.revbits.net'});
    const cred = createC.toJSON();
    res.cookie('proxy-user-id',cred.id);
    return res.redirect('/dashboard');
    } catch (error) {
        return res.json({error:'Something went wrong try again later'});
        
    }
}

const esPortalApp = async (res,proxyApp) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
        const response = await axios.post(proxyApp.targetUrl+'/api/v2/auth/login', {
            ...proxyApp.credentials
         });
         const createC = await createUserCred({
            credentials:{
                ...response.data.response,
                userData:{
                    ...response.data.response.userData,
                    sessiontoken:response.data.response.token
                }
            },
            siteName:'es',
            targetUrl:'https://es.revbits.com'
        });
        const cred = createC.toJSON();
        res.cookie('proxy-user-id',cred.id);
         res.cookie('siteName',proxyApp.slug);
         res.cookie('targetUrl',proxyApp.targetUrl);
         return res.redirect('/');
    } catch (error) {
        console.log(error)
        return res.json({error:'Something went wrong try again later'});
        
    }
}

module.exports = {
    ztnAndEnpast,
    epsApp,
    updatePortalApp,
    acmePortalApp,
    dtPortalApp,
    esPortalApp
}