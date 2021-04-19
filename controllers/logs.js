const {Op} = require('sequelize')
const Logs = require('../database/models/index').Logs;
const getAllLogs = async (req, res) => {
    try {
        const logs = await Logs.findAll({
           where:{
            url:{
                [Op.like]:'%/pam%'
            }}
        });
        return res.status(200).json({ logs });
    } catch (error) {
        console.log(error)
        return res.status(404).json({ error: 'error' });
    }
}

const create = async (req, res) => {
    try {
        const createLog = await createLogs(req);    
        return res.status(200).json({ createLog });
    } catch (error) {
        console.log(error);
        return res.status(404).json({error: error})
    }
}

const createLogs = async (req) => {
    const body = req.body;
    const params = req.params;
    const query = req.query;
    const data = {url:req.url};
    if (req.method) {
        data.method = req.method;
    }
    if (body) {
        data.body = {...body};
    }
    if (Object.keys(params).length > 0) {
        data.params = params;
    }
    if (Object.keys(query).length > 0) {
        data.queryParams = query;
    }
    const res = await Logs.create(data);
    return res;

}

module.exports = {
    getAllLogs,
    create,
    createLogs
};
