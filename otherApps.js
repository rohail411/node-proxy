const axios = require('axios');
const unirest = require('unirest');
var qs = require('qs');

const linkedinApp = async (res, proxyApp) => {
    const getCookies = await axios.post('https://www.linkedin.com/checkpoint/lg/login-submit', {});
    const cookies = getCookies.headers['set-cookie'];
    let strCookies = '';
    let csrf = '';
    let jass = '';
    cookies.map((v) => {
        if (/bcookie=/.test(v)) {
            csrf = v.split('"')[1].split('&')[1];
        }
        if (/JSESSIONID=/.test(v)) {
            jass = v.split('"')[1];
        }
        strCookies += v.split(';')[0] + '; ';
    });
    var req = unirest('POST', 'https://www.linkedin.com/checkpoint/lg/login-submit')
        .headers({
            authority: 'www.linkedin.com',
            'cache-control': 'max-age=0',
            'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'upgrade-insecure-requests': '1',
            origin: 'https://www.linkedin.com',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
            accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            referer:
                'https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin',
            'accept-language': 'en-US,en;q=0.9',
            cookie: strCookies
        })
        .send(`csrfToken=${jass}`)
        .send(`session_key=${proxyApp['credentials']['email']}`)
        .send(`loginCsrfParam=${csrf}`)
        .send(`session_password=${proxyApp['credentials']['password']}`)
        .end(function (resp) {
            if (resp.error) throw new Error(resp.error);
            resp.headers['set-cookie'] =
                resp.headers['set-cookie'].map((cookie) => {
                    cookie = cookie.split('.www.linkedin.com').join('localhost');
                    cookie = cookie.split('.linkedin.com').join('localhost');
                    cookie = cookie.split('linkedin.com').join('localhost');
                    return cookie;
                }) || [];

            console.log(resp.headers['set-cookie']);
            res.setHeader('set-cookie', resp.headers['set-cookie']);
            res.cookie('siteName', proxyApp.slug);
            res.cookie('targetUrl', proxyApp.targetUrl);
            res.cookie('currentUser', proxyApp.user.id);
            res.cookie('companyId', proxyApp.companyId);
            return res.redirect('/');
        });
};

const twitterApp = async (res, proxyApp) => {
    var req = unirest('POST', 'https://twitter.com/sessions')
        .headers({
            authority: 'twitter.com',
            'cache-control': 'max-age=0',
            'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'upgrade-insecure-requests': '1',
            origin: 'https://twitter.com',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
            accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            referer: 'https://twitter.com/login',
            'accept-language': 'en-US,en;q=0.9',
            cookie:
                'personalization_id="v1_tF2GV6iwkpxQrIzywcSzYg=="; guest_id=v1%3A162013416694510576; ct0=59ad476a94b08b661546ef434ede35ea; _ga=GA1.2.328589591.1620134172; _gid=GA1.2.316708374.1620134172; _sl=1; gt=1389569547397697538; _twitter_sess=BAh7CSIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7ADoPY3JlYXRlZF9hdGwrCM2UhTd5AToMY3NyZl9p%250AZCIlZTg4NjRhOTg5ZDU4MGZiN2M5YWM4YjgwNDdkMDVhZWQ6B2lkIiVkNjc1%250AN2IxOTU0ZmNkNzUyMjJlZGJmMjcwY2Q5N2I0ZQ%253D%253D--59d235c9ff90a64fb13f372fd1ce9d474c7cca23; _mb_tk=e6d85f80acda11eb819f995015b81fac; _twitter_sess=BAh7CiIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7ADoPY3JlYXRlZF9hdGwrCM2UhTd5AToMY3NyZl9p%250AZCIlZTg4NjRhOTg5ZDU4MGZiN2M5YWM4YjgwNDdkMDVhZWQ6B2lkIiVkNjc1%250AN2IxOTU0ZmNkNzUyMjJlZGJmMjcwY2Q5N2I0ZToJdXNlcmwrCQCwV1OCcT4T--83c2011a10fc16d18086093139b450c1952fcce7; ads_prefs="HBERAAA="; ct0=f5e01935be4c3719d02e1660c8270a8ecedc846e49a072b0fe636b2748579d3d1112405cf1ea00484020201839247d3b8aeeb5e4794b4d716e10ea0f2ef3031e1dbc50cea2ffa3b2de1eaad9bd0e91b0; kdt=Gln7CtnwaMsdHuCGujQYo7iWDFf5hIHOVZgR8atz; remember_checked_on=1; twid=u%3D1386670539834634240'
        })
        .send('redirect_after_login=/')
        .send('remember_me=1')
        .send('authenticity_token=e6d85f80acda11eb819f995015b81fac')
        .send('wfa=1')
        .send(
            'ui_metrics={"rf":{"b2007831cf83e6c930c6646d9987c22776e2904266054818391138af183d2c34":14,"f98a028d9374f0859dfdf619490ce9bc99ea2d6b47086965e65474fdd5bad636":-88,"ce044d05ef37aeaba3764bc37d3a7ffb6b5189353feb15723ed126c6832e42bb":224,"ae66012d32acff25e6916a6fb01b1c4d7f5e47c164a45db9a7fbbe793c35fad1":1},"s":"BiOehdu72YCftFDVkNntyweDMlYdNdIU__J8M0NdBp_3TS5Banm3V_NT2_oQHJ1-QhpW6IwCwxoLO9L2mwuM9X_qhekNbzdfDQ89UrnPdr8Jxb0BBMEQEkD0PXCCgIoUqNoHInsG7c2xdb10fCIusuO2BfvDZhX7Ne07uqXp_uHMcWfVOs3j7M67IpSApVeWksz4sQwB08ax6f2WH-udRlj0LfO4MEc7IznN_Hc89xktjeduVe7utMSe-eHr9KwYnSRyOfm93cyMfzK65-YaQwITrxVx7Qm8qkb30r9gbBKn_AQ9P1qevpJjyAKnXrPWoqQfEnTaWyPM-MaGkM0W6AAAAXk3hZ6-"}'
        )
        .send(`session[username_or_email]=${proxyApp['credentials']['email']}`)
        .send(`session[password]=${proxyApp['credentials']['password']}`)
        .end(function (resp) {
            if (resp.error) throw new Error(resp.error);
            resp.headers['set-cookie'] =
                resp.headers['set-cookie'].map((cookie) => {
                    cookie = cookie.split('.twitter.com').join('localhost');
                    return cookie;
                }) || [];
            res.setHeader('set-cookie', resp.headers['set-cookie']);
            res.cookie('siteName', proxyApp.slug);
            res.cookie('targetUrl', proxyApp.targetUrl);
            res.cookie('currentUser', proxyApp.user.id);
            res.cookie('companyId', proxyApp.companyId);
            return res.redirect('/');
        });
};

const instagramApp = async (res, proxyApp) => {
    var data = qs.stringify({
        username: 'movit33099@goqoez.com',
        enc_password:
            '#PWD_INSTAGRAM_BROWSER:10:1620317416:AdNQAEe75Qjb5wI8+xlscCbQT7rgWr1QcDlHul+PumQL1HEnRe5ASy7eSRLv/5M1LnrYwdIlW/TUn/95LGuTefsfFc0eaeed5nNHNc/XyIGA0cAtH/I2jkMd//3UN1aqNuk9/+5+m+iXiRwB1SMAgsjZSQ==',
        queryParams: '{}',
        optIntoOneTap: 'false',
        stopDeletionNonce: ''
    });
    var config = {
        method: 'post',
        url: 'https://www.instagram.com/accounts/login/ajax/',
        headers: {
            authority: 'www.instagram.com',
            pragma: 'no-cache',
            'cache-control': 'no-cache',
            'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            'x-ig-www-claim': 'hmac.AR0irmnttkntqBjorBzG_tRAdwL-rDCGqiyfqqTz3yR_2ZAq',
            'sec-ch-ua-mobile': '?0',
            'x-instagram-ajax': 'c98595793073',
            'content-type': 'application/x-www-form-urlencoded',
            accept: '*/*',
            'x-requested-with': 'XMLHttpRequest',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
            'x-csrftoken': 'nl6PSrlNM1atULmmC6m2TB6CBkqfbaTO',
            'x-ig-app-id': '936619743392459',
            origin: 'https://www.instagram.com',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            referer: 'https://www.instagram.com/',
            'accept-language': 'en-US,en;q=0.9',
            cookie:
                'csrftoken=nl6PSrlNM1atULmmC6m2TB6CBkqfbaTO; mid=YJQUzgAEAAHyTpVGSqdj7P6gh7t9; ig_did=92828C09-8C49-490B-9F87-65838C093F80; ig_nrcb=1; fbsr_124024574287414=e7AUXR0Be1PnQSG8zCW1SVJMBdExB7etmNxty-CU60k.eyJ1c2VyX2lkIjoiMTAwMDA4MDA1MzAxNDgyIiwiY29kZSI6IkFRRG1HazkxX3FBNXp4RlQ4TVlkY1BjaHJmbjFvLS0wR241aTBIcWdIT2NNZWZVUGcyeklTTlZuTm95WHdxSkVYVGFJSUtyT0tHYmRWYjg3N3dYazdQckMxb0hBOElGNEV0QlduYV9yOGtwSEpRZ19mYkN1T1FWbGJ1NVM4ekh0ckNVeU5GVzV0OHNOakJZWU5VV05oTlFqeklsVDd2S2c4QXhnMUViRDVjZTdRMUZpd0l0UnFRRG1uU1V3QWthLTc0OTFhZU9ob3lCOXZaaVlOZmNPVWUyR3V1MnBqZGZ3cmtrWmNNVnNvajEwR2Y2b21MdVp0NFhBWFN5aGhMT3EwNU5rczZINTUwU1JVWmVaT3hXTkZXbFR3QzljVlJPc1FHX2JUOVc1QjctUHlqUm54V0pqQnZ4Q3owelRleElsY2V4MVVZdmtRTklBUk8tQmVSNThBSnlnIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCQUt5WkJwbnlMMklkeVlzMExaQlZIUXVXeW5oemhyc2RvU1JMQ1ZrUGllWkJlSHAxYWttTG50VW80ZTZoMnhkdnNYMDFjNjRuSHJuVWFxOGh5Yk1TRGM1ZTlMWkNvTWlIb1V2NkFaQTMxaktIY2xDdGRmNzRWMXM4anQ5WkNQdGpBcXpJNGZmcVE4SkVTZ1pBUTA2eGxaQVdxamVVVmlnRE1TYmZqWDdFeTZrSSIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjIwMzE3MTg0fQ'
        },
        data: data
    };

    axios(config)
        .then(function (resp) {
            resp.headers['set-cookie'] =
                resp.headers['set-cookie'].map((cookie) => {
                    cookie = cookie.split('.www.instagram.com').join('localhost');
                    cookie = cookie.split('.instagram.com').join('localhost');
                    cookie = cookie.split('instagram.com').join('localhost');
                    return cookie;
                }) || [];
            res.setHeader('set-cookie', resp.headers['set-cookie']);
            res.cookie('siteName', proxyApp.slug);
            res.cookie('targetUrl', proxyApp.targetUrl);
            res.cookie('currentUser', proxyApp.user.id);
            res.cookie('companyId', proxyApp.companyId);

            return res.redirect('/');
        })
        .catch(function (error) {
            return res.json({ error });
        });
};

const zendesk = async (res,proxyApp)=>{
    var axios = require('axios');
var qs = require('qs');
var data = qs.stringify({
  'utf8': '✓',
  'authenticity_token': 'DeEQ5INpBfd1Ws6N+b/WBIccrPN22/SvkQZiQJwHCuY=',
  'return_to_on_failure': '/auth/v2/login/signin?return_to=https%3A%2F%2Finvozone.zendesk.com%2F&theme=hc&locale=1&auth_origin=%2Cfalse%2Ctrue&browser=chrome',
  'return_to': 'https://invozone.zendesk.com/auth/v2/login/signed_in?auth_origin=%2Cfalse%2Ctrue&theme=hc',
  'brand_id': '',
  'theme': 'hc',
  'auth_origin': '',
  'form_origin': 'other',
  'user[email]': 'rohail.butt@invozone.com',
  'user[password]': '11979944Rohail!',
  'commit': 'Sign+in' 
});
var config = {
  method: 'post',
  url: 'https://invozone.zendesk.com/access/login',
  headers: { 
    'authority': 'invozone.zendesk.com', 
    'cache-control': 'max-age=0', 
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"', 
    'sec-ch-ua-mobile': '?0', 
    'upgrade-insecure-requests': '1', 
    'origin': 'https://invozone.zendesk.com', 
    'content-type': 'application/x-www-form-urlencoded', 
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36', 
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 
    'sec-fetch-site': 'same-origin', 
    'sec-fetch-mode': 'navigate', 
    'sec-fetch-user': '?1', 
    'sec-fetch-dest': 'iframe', 
    'referer': 'https://invozone.zendesk.com/auth/v2/login/signin?return_to=https%3A%2F%2Finvozone.zendesk.com%2F&theme=hc&locale=1&auth_origin=%2Cfalse%2Ctrue&browser=chrome', 
    'accept-language': 'en-US,en;q=0.9', 
    'cookie': '__cfruid=117119b2c4029bd98029f66be18459648af89ab4-1621236279; __cf_bm=9b1a24c495fb00299e1fd957e64cbe90a734873a-1621236282-1800-AQQmyJBNzh19aUBMUmWgyRk6Kw4yEz8KIqBfnUFgy3TI/mlWZw6MuSOV6wW8B1garKLAICQVZGdQRkJaNXJnv1x9Szour3coCFmOP1RSMWsRbWuGEzzD+MatNCU6kG3prurEVT+3OtVzC32ns9hbWe0418i9lbwjZ92Ga6/7w3V7XFdkjwohot2++mpeaURFvA==; _zendesk_cookie=BAhJIkp7ImRldmljZV90b2tlbnMiOnsiMzgyNTY3MDY0OTk3IjoiNVBzUUdXOUk2N1ZhNnRMOUFoQjdIM3psRzVpdXNWRGoifX0GOgZFVA%3D%3D--1bcbcae06c1a88f01bed5a70a66a972ea738ece6; _gid=GA1.2.1765725894.1621236293; _zendesk_shared_session=-ZTV3R0Y3cCs1Vmhhd2lobHV2RU9mVlNaSi9TQ1dxTlRYVGZkSlpXS1ExbmFMMVd5dGRZMUp0ZUZyU1B0UllBbVVWV1d4THVFSVVFZDBTdXJmZ2xDNlhvcVV0bXFuK1BIbHA4ODlJU0dxcldtemJMTlJ0NzJtRzBUVU1nVUJ5Y01kSFdDcWlNY2pJN1o0ajBXbE94cm1RPT0tLWJCenBHbXJsb0svRGgzeEV3WU0zamc9PQ%3D%3D--50dd4a1287d702a17691195107a4e8d849846b48; _zendesk_session=BAh7CkkiD3Nlc3Npb25faWQGOgZFVEkiJTc4NDhiNzYwYTQ5MWJlYmJhYjUxYzkxMjc2MDJhMTRhBjsAVEkiDmlzX21vYmlsZQY7AFRGSSIMYWNjb3VudAY7AEZpA572pkkiE3dhcmRlbi5tZXNzYWdlBjsAVHsASSIQX2NzcmZfdG9rZW4GOwBGSSIxRGVFUTVJTnBCZmQxV3M2TitiL1dCSWNjclBOMjIvU3ZrUVppUUp3SEN1WT0GOwBG--8278078b728bdd4d19b97fd326de6bdede48abd5; optimizelyEndUserId=oeu1621236373102r0.004825456798271288; ajs_anonymous_id=%223e90f53f-7720-4a55-ab82-6c585bb36bc2%22; _gcl_au=1.1.1791226308.1621236374; _fbp=fb.1.1621236374104.103207479; _hjTLDTest=1; _hjid=f64b8f15-03bf-4c93-a2de-5ce354d75ca9; _hjAbsoluteSessionInProgress=0; _biz_sid=8dee58; _biz_ABTestA=%5B1663819921%5D; _biz_uid=d32618e443d44616a1d04e7ea47df3d7; _biz_flagsA=%7B%22Version%22%3A1%2C%22ViewThrough%22%3A%221%22%2C%22XDomain%22%3A%221%22%7D; _ga_FBP7C61M6Z=GS1.1.1621236373.1.1.1621236387.0; flight=%7B%22first_touch_timestamp%22%3A1621236373247%2C%22last_touch_timestamp%22%3A1621236387572%2C%22first_referrer%22%3A%22%22%2C%22last_referrer%22%3A%22%22%2C%22first_landing_page%22%3A%22https%3A%2F%2Fwww.zendesk.com%2F%22%2C%22last_landing_page%22%3A%22https%3A%2F%2Fwww.zendesk.com%2Fdesktop%2F%22%2C%22time_on_site%22%3A0%2C%22total_time_on_site%22%3A0%2C%22page_views%22%3A2%2C%22visits%22%3A1%2C%22trials%22%3A0%2C%22domain%22%3A%22none%22%2C%22seenOffer%22%3A%22ProactiveChat%22%2C%22seenOfferVersion%22%3A%221.0.4%22%7D; _uetsid=6270e660b6e011eba77687dbda8fe038; _uetvid=627107e0b6e011eb870805bb3bb460aa; _biz_nA=4; _biz_pendingA=%5B%5D; _ga=GA1.2.2075220401.1621236293; _zendesk_cookie=BAhJIkp7ImRldmljZV90b2tlbnMiOnsiMzgyNTY3MDY0OTk3IjoiNVBzUUdXOUk2N1ZhNnRMOUFoQjdIM3psRzVpdXNWRGoifX0GOgZFVA%3D%3D--1bcbcae06c1a88f01bed5a70a66a972ea738ece6; _zendesk_session=BAh7CkkiD3Nlc3Npb25faWQGOgZFVEkiJWIwZDY3ZmEwOWIzMDZlYTcyOWU4YTY3NGE3YjFkOWViBjsAVEkiDmlzX21vYmlsZQY7AFRGSSIMYWNjb3VudAY7AEZpA572pkkiE3dhcmRlbi5tZXNzYWdlBjsAVHsASSIQX2NzcmZfdG9rZW4GOwBGSSIxRGVFUTVJTnBCZmQxV3M2TitiL1dCSWNjclBOMjIvU3ZrUVppUUp3SEN1WT0GOwBG--835d82ff46853a972e1edc19798e1c2f629adf00; _zendesk_shared_session=-TGhJQWtqS0dnek5VVGw2cGpWYlpodFdUWUl0dkptTDRtN1Q0WHYvRTBZbFAyZzRneHc0d0d5MjBRVElRTk9hVE5XTEFlZDc1V0VMQ2VFbUV0VEZGQ3FHcTRKbDlYY1pld2dBREh6K0VGODRkQ3NWbmgxT1JtWmFaM3NsWjRKMEUtLWJsWVI5V3NrS0Z5dmVsMS9nOWJRcXc9PQ%3D%3D--62bce452e4ed630769041e6e58afa423a0dafa89'
  },
  data : data
};

axios(config)
.then(function (response) {
    console.log(JSON.stringify(response.data));
    let d = response.data.split('invozone.zendesk.com').join('localhost');
    return res.send(d);
})
.catch(function (error) {
  console.log(error);
  res.json({error});
});

}

module.exports = {
    linkedinApp,
    twitterApp,
    instagramApp,
    zendesk
};
