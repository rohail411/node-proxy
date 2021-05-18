const { Op, QueryTypes } = require('sequelize');
const Logs = require('../database/models/index').Logs;
const db = require('../database/models/index');
const modules = require('../modules');
const axios = require('axios');
const {pamSessionSchemaValidate} = require('../validation');
const {apps} = require('../utils');
const getAllLogs = async (req, res) => {
    try {
        let daysQuery = '';
        let userQuery = '';
        let groupByQuery = '';
        let groupBySelect = '';
        const { companyId } = req.params;
        const { days, userId, groupBy } = req.query;
        if (days) {
            daysQuery = `AND log."createdAt"::date >= now()::date - integer '${days}'`;
        }
        if (userId) {
            userQuery = `AND log."userId"='${userId}'`;
        }
        if (typeof groupBy === 'string') {
            groupByQuery = `log."${groupBy}"`;
            groupBySelect = `log."${groupBy}" as name`;
        } else if (typeof groupBy !== 'string') {
            groupBy.forEach((item, i) => {
                groupByQuery =
                    groupByQuery +
                    `${i > 0 ? ',' : ''} log."${item}"${item === 'createdAt' ? '::date' : ''}`;
                if (item === 'createdAt') {
                    groupBySelect =
                        groupBySelect +
                        `${
                            i > 0 ? ',' : ''
                        } to_char(log."createdAt"::date, 'MM/DD/YYYY') as label `;
                } else {
                    groupBySelect = groupBySelect + `${i > 0 ? ',' : ''} log."${item}" as name `;
                }
            });
        }

        // return res.json({label:groupByQuery});
        // const logs = await Logs.findAll({});
        // return res.json({groupBy});

        //     return db.sequelize
        //   .query(
        //     `SELECT to_char(log."createdAt"::date, 'MM/DD/YYYY') as label ${groupByQuery} ,
        //     count(*) as value from "Logs" log
        //     WHERE log."companyId"='${companyId}'
        //     ${daysQuery}
        //     ${userQuery}
        //     GROUP BY log."createdAt"::date ${groupByQuery}
        //     ORDER BY log."createdAt"::date;`,
        //     { type: QueryTypes.SELECT },
        //   )
        //   .then(function(_data) {
        //     return res.json({data:_data});
        //   })
        //   .catch(function(error) {
        //     return res.json({error});
        //   });
        return db.sequelize
            .query(
                `SELECT ${groupBySelect},
        count(*) as value from "Logs" log 
        WHERE log."companyId"='${companyId}' ${daysQuery} ${userQuery}
        GROUP BY ${groupByQuery}
        ORDER BY ${groupByQuery};`,
                { type: QueryTypes.SELECT }
            )
            .then(function (_data) {
                return res.json({ data: _data, groupBySelect });
            })
            .catch(function (error) {
                return res.json({ error });
            });
    } catch (error) {
        console.log(error);
        return res.status(404).json({ error: 'error' });
    }
};

const create = async (req, res) => {
    try {
        const createLog = await createLogs(req);
        return res.status(200).json({ createLog });
    } catch (error) {
        console.log(error);
        return res.status(404).json({ error: error });
    }
};

const createLogs = async (req) => {
    const body = req.body;
    const params = req.params;
    const query = req.query;
    const data = { url: req.url };
    const userId = req.cookies['currentUser'];
    const companyId = req.cookies['companyId'];
    const siteName = req.cookies['siteName'];
    if (req.method) {
        data.method = req.method;
    }
    if (body) {
        data.body = { ...body };
    }
    if (Object.keys(params).length > 0) {
        data.params = params;
    }
    if (Object.keys(query).length > 0) {
        data.queryParams = query;
    }
    if (userId) {
        data.userId = userId;
    }
    if (companyId) {
        data.companyId = companyId;
    }
    if (siteName) {
        data.siteName = siteName;
    }
    if (siteName === 'ztn' || siteName === 'enpast') {
        data.module = req.url.trim().split('/')[3];
    } else {
        let arr = [];
        if (siteName && Object.keys(modules[siteName]).length > 0) {
            arr = Object.keys(modules[siteName]);
            const found = arr.find((item) => req.url.includes(item));
            data.module = modules[siteName][found] || '';
        }
    }
    const res = await Logs.create(data);    
    return res;
};

const proxyStartSessionForPam = async (req,res) =>{
    const {error,value} = pamSessionSchemaValidate(req.body);
    if(error){
        return res.json({error:error.details[0].message});
    }
    try {
        const proxyApp = await axios.post('https://staging.enpast.com:8443/api/v1/StartSession',{
        ...req.body,
        userIp: req.ip.split(':').slice(-1)[0]
        });
        if(proxyApp.data.return_code===1000){
            const {data:{data:{session_id,asset}}} = proxyApp;
            const app = {
                siteName:asset.appName,
                slug:asset.appName,
                targetUrl:asset.hostname,
                user:{
                    id:session_id
                },
                credentials:{
                    email:asset.username,
                    password:asset.password
                }
            }
            return res.json(app)
            return apps(res,app);
        }
        else {
            return res.json({error:'something went wrong'});
        }
    } catch (error) {
        return res.json({error:'something went wrong'});
    }
    
}


module.exports = {
    getAllLogs,
    create,
    createLogs,
    proxyStartSessionForPam
};
