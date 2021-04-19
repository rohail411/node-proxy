const {getOneUserCred} =require('./controllers/user-credentials');

function modifyBodyZtnAndEnpast(req,body){
    let service_url = '';
    let socket_url = '';
       
    if(req.site && req.targetUrl){
        service_url = req?.targetUrl;
        socket_url = req?.targetUrl.split('https://')[1]
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

async function modifyBodyEps(req,body){
    if (body && typeof body === "string") {
        //es.revbits.net
        // body = body.split('https://eps.revbits.com').join(process.env.PROXY_URL)
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

async function modifyBodyUpdate(req,body){
    if (body && typeof body === "string") {
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

async function modifyBodyDt(req,body){
    if (body && typeof body === "string") {
        if (body.includes('</body>')) {
            body = body.split('"+location.hostname+"').join('dt.revbits.net')
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

async function modifyBodyAcme(req,body){
    if (body && typeof body === "string" ) {
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

async function modifyBodyEs(req,body){
    if (body && typeof body === "string") {
        if (body.includes('</body>') && body.includes('https://es.revbits.com/es_preloader.gif')) {
            let cred = await getOneUserCred(req.cookies['proxy-user-id']);
            cred = cred.toJSON();
            const dynamicScript = `<script type="text/javascript">
            localStorage.setItem('userData','${JSON.stringify(cred.credentials.userData)}');
            localStorage.setItem('roles','${JSON.stringify(cred.credentials.userData.roles)}');
            localStorage.setItem('permissions','${JSON.stringify(cred.credentials.userData.permissions)}');
            </script></body>`;
            body = body.split('</body>').join(dynamicScript);

        }

    }
    return body;
}

module.exports = {
    modifyBodyZtnAndEnpast,
    modifyBodyUpdate,
    modifyBodyEs,
    modifyBodyEps,
    modifyBodyDt,
    modifyBodyAcme
}