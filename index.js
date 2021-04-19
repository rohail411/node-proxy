const path = require('path');
const https = require('https');
const fs = require('fs');
const {app} = require('./app');
const options = {
    cert:fs.readFileSync(path.join(__dirname,'ssl','cip.crt')),
    key:fs.readFileSync(path.join(__dirname,'ssl','cip.key'))
}

// app.listen(3000,()=>console.log('Proxy listen on 3000'));

https.createServer(options,app).listen(process.env.PORT,()=>console.log('Server started on Port:443'));