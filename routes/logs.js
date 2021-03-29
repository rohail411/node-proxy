const logsController = require('../controllers/logs');

module.exports = (router) => {
    router.get('/get', logsController.getAllLogs);
    router.use('/create/:id', logsController.create);
    return router;
}
