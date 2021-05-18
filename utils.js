const {
    ztnAndEnpast,
    epsApp,
    updatePortalApp,
    esPortalApp,
    acmePortalApp,
    dtPortalApp
} = require('./revbitsApp');

const { linkedinApp, twitterApp, instagramApp, zendesk } = require('./otherApps');

const parseCookie = (str) => {
    return str
        .split(';')
        .map((v) => v.split('='))
        .reduce((acc, v) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
            return acc;
        }, {});
};

const apps = async (res,proxyApp)=>{
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
        case 'zendesk':
            return zendesk(res, proxyApp);
        default:
            return res.json({error:'something went wrong'})
    }
}



module.exports = { parseCookie,apps };
