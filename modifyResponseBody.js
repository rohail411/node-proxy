const { getOneUserCred } = require('./controllers/user-credentials');
const { HOST } = process.env;
function modifyBodyZtnAndEnpast(req, body) {
    let service_url = '';
    let socket_url = '';

    if (req.site && req.targetUrl) {
        service_url = req?.targetUrl;
        socket_url = req?.targetUrl.split('https://')[1];
    }
    if (body && typeof body === 'string') {
        body = body.split('https://"+location.hostname+"').join(process.env.PROXY_URL);
        body = body
            .split(`location.protocol+"//"+location.hostname`)
            .join(`"${process.env.PROXY_URL}"`);
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

async function modifyBodyEps(req, body) {
    if (body && typeof body === 'string') {
        if (body.includes('<!--CIP-SCRIPT-HERE-->')) {
            let cred = await getOneUserCred(req.cookies['proxy-user-id']);
            cred = cred.toJSON();
            const dynamicScript = `<script type="text/javascript">
            localStorage.setItem('satellizer_token','${req.cookies['satellizer_token']}');
            localStorage.setItem('_mod','${cred.credentials.mod}');
            </script>`;
            body = body.replace('<!--CIP-SCRIPT-HERE-->', dynamicScript);
        }
    }
    return body;
}

async function modifyBodyUpdate(req, body) {
    if (body && typeof body === 'string') {
        if (body.includes('</body>')) {
            let cred = await getOneUserCred(req.cookies['proxy-user-id']);
            cred = cred.toJSON();
            const dynamicScript = `<script type="text/javascript">
            sessionStorage.setItem('authToken',${JSON.stringify(cred.credentials.token)});
            sessionStorage.setItem('cred','${JSON.stringify(cred.credentials)}');
            sessionStorage.setItem('userRole','client');
            </script></body>`;
            body = body.split('</body>').join(dynamicScript);
        }
    }
    return body;
}

async function modifyBodyDt(req, body) {
    if (body && typeof body === 'string') {
        if (body.includes('</body>')) {
            body = body.split('"+location.hostname+"').join('dt.revbits.net');
            let cred = await getOneUserCred(req.cookies['proxy-user-id']);
            cred = cred.toJSON();
            const dynamicScript = `<script type="text/javascript">
            sessionStorage.setItem('satellizer_token',${JSON.stringify(cred.credentials.token)});
            </script></body>`;
            body = body.split('</body>').join(dynamicScript);
        }
    }
    return body;
}

async function modifyBodyAcme(req, body) {
    if (body && typeof body === 'string') {
        if (body.includes('</body>') && body.includes('<div id="root">')) {
            const dynamicScript = `<script type="text/javascript">
            sessionStorage.setItem('authToken','${req.cookies['authToken']}');
            sessionStorage.setItem('_pportalref','${req.cookies['authToken']}');
            </script></body>`;
            body = body.split('</body>').join(dynamicScript);
        }
    }
    return body;
}

async function modifyBodyEs(req, body) {
    if (body && typeof body === 'string') {
        if (body.includes('</body>') && body.includes('https://es.revbits.com/es_preloader.gif')) {
            let cred = await getOneUserCred(req.cookies['proxy-user-id']);
            cred = cred.toJSON();
            const dynamicScript = `<script type="text/javascript">
            localStorage.setItem('userData','${JSON.stringify(cred.credentials.userData)}');
            localStorage.setItem('roles','${JSON.stringify(cred.credentials.userData.roles)}');
            localStorage.setItem('permissions','${JSON.stringify(
                cred.credentials.userData.permissions
            )}');
            </script></body>`;
            body = body.split('</body>').join(dynamicScript);
        }
    }
    return body;
}

async function modifyBodyIn(body) {
    if (body && typeof body === 'string') {
        body = body.split('https://').join(`https://${HOST}?returnUrl=`);
        body = body
            .split(`https://${HOST}?returnUrl=instagram.flhe7-1.fna.fbcdn.net/`)
            .join('https://cors-anywhere.herokuapp.com/https://instagram.flhe7-1.fna.fbcdn.net/');
        body = body
            .split(`https://${HOST}?returnUrl=instagram.fist1-2.fna.fbcdn.net/`)
            .join('https://cors-anywhere.herokuapp.com/https://instagram.fist1-2.fna.fbcdn.net/');
        body = body
            .split(`https://${HOST}?returnUrl=instagram.flhe3-1.fna.fbcdn.net/`)
            .join('https://cors-anywhere.herokuapp.com/https://instagram.flhe3-1.fna.fbcdn.net/');
        //Facebook
        body = body.split('www.facebook.com').join('localhost');
        // body = body.split('facebook.com').join('localhost');
        // body = body.split('edge-chat.facebook.com').join('localhost');
        //END
        body = body.split('www.instagram.com').join('localhost');
        body = body.split('i.instagram.com').join('localhost');
        // body = body.split('.instagram.com').join('localhost');
    } else {
        body = JSON.parse(
            JSON.stringify(body)
                .split('https://instagram.flhe7-1.fna.fbcdn.net/')
                .join(
                    'https://cors-anywhere.herokuapp.com/https://instagram.flhe7-1.fna.fbcdn.net/'
                )
        );
        body = JSON.parse(
            JSON.stringify(body)
                .split('https://instagram.fist1-2.fna.fbcdn.net/')
                .join(
                    'https://cors-anywhere.herokuapp.com/https://instagram.fist1-2.fna.fbcdn.net/'
                )
        );
        body = JSON.parse(
            JSON.stringify(body)
                .split('https://instagram.flhe3-1.fna.fbcdn.net/')
                .join(
                    'https://cors-anywhere.herokuapp.com/https://instagram.flhe3-1.fna.fbcdn.net/'
                )
        );
    }
    return body;
}

async function modifyBodyFa(body) {
    if (body && typeof body === 'string') {
        //Facebook
        body = body.split('www.facebook.com').join('localhost');
        // body = body.split('edge-chat.facebook.com').join('localhost');
        // body = body.split('facebook.com').join('localhost');
        // body = body.split('edge-chat.facebook.com').join('localhost');
        //END 
    } 
    return body;
}

async function modifyBodyTw(body) {
    if (body && typeof body === 'string') {
        body = body.split('api.twitter.com').join(`${HOST}`);
        body = body.split('twitter.com').join(`${HOST}`);
        body = body.split('abs.twimg.com').join(`${HOST}`);
    }
    return body;
}

async function modifyBodyLi(body) {
    if (body && typeof body === 'string') {
        // body = body.split('linkedin.com').join('localhost');
        // body = body.split('www.linkedin.com').join('localhost');
        // body = body.split('https://www.linkedin.com').join('https://localhost');
        body = body.split('src="https://static-exp1.licdn.com').join(`src="https://${HOST}`);
        body = body
            .split('data-delayed-url="https://static-exp1.licdn.com')
            .join(`data-delayed-url="https://${HOST}`);
    }
    return body;
}

async function modifyProxyResLi(proxyRes) {
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['content-security-policy-report-only'];
    if (proxyRes.headers['location']) {
        proxyRes.headers['location'] = proxyRes.headers['location']
            .split('www.linkedin.com')
            .join(`${HOST}`);
    }
    proxyRes.headers['set-cookie'] =
        proxyRes.headers['set-cookie']?.map((item) => {
            item = item.split('.www.linkedin.com').join(`${HOST}`);
            item = item.split('.linkedin.com').join(`${HOST}`);
            item = item.split('linkedin.com').join(`${HOST}`);
            return item;
        }) || [];

    return proxyRes;
}

async function modifyProxyResTw(proxyRes) {
    delete proxyRes.headers['content-security-policy'];
    proxyRes.headers['location'] = `https://${HOST}`;
    proxyRes.headers['set-cookie'] =
        proxyRes.headers['set-cookie']?.map((item) => {
            item = item.split('.twitter.com').join(`${HOST}`);
            return item;
        }) || [];
    return proxyRes;
}

async function modifyProxyResIn(proxyRes) {
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['cross-origin-embedder-policy-report-only'];
    // delete proxyRes.headers['access-control-expose-headers'];
    delete proxyRes.headers['report-to'];
    proxyRes.headers['location'] = `https://${HOST}`;
    proxyRes.headers['set-cookie'] =
        proxyRes.headers['set-cookie']?.map((item) => {
            item = item.split('.instagram.com').join(`${HOST}`);
            item = item.split('www.instagram.com').join(`${HOST}`);
            item = item.split('instagram.com').join(`${HOST}`);
            if (
                item.includes('siteName') ||
                item.includes('targetUrl') ||
                item.includes('currentUser') ||
                item.includes('companyId')
            ) {
                // return item;
            } else return item;
        }) || [];
    // proxyRes.headers['set-cookie'] = []
    return proxyRes;
}

async function modifyProxyResFa(proxyRes) {
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['strict-transport-security'];
    delete proxyRes.headers['report-to'];
    proxyRes.headers['X-Frame-Options']='SAMEORIGIN';
    proxyRes.headers['location'] = 'https://localhost';
    proxyRes.headers['set-cookie'] =
        proxyRes.headers['set-cookie']?.map((item) => {
            item = item.split('www.facebook.com').join(`${HOST}`);
            item = item.split('.facebook.com').join(`${HOST}`);
            item = item.split('facebook.com').join(`${HOST}`);

            return item;
        }) || [];
    return proxyRes;
}

module.exports = {
    modifyBodyZtnAndEnpast,
    modifyBodyUpdate,
    modifyBodyEs,
    modifyBodyEps,
    modifyBodyDt,
    modifyBodyAcme,
    modifyBodyIn,
    modifyBodyTw,
    modifyBodyLi,
    modifyProxyResTw,
    modifyProxyResLi,
    modifyProxyResIn,
    modifyProxyResFa,
    modifyBodyFa
};
