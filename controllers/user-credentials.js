const UserCredentials = require('../database/models/index').UserCredentials;

const createUserCred = async (body) => {
    const doc = await UserCredentials.create({ ...body });
    return doc;
};

const getOneUserCred = async (id) => {
    const doc = await UserCredentials.findOne({ where: { id: id } });
    return doc;
};

module.exports = {
    createUserCred,
    getOneUserCred
};
