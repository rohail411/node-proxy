const logsController = require('../controllers/logs');

module.exports = (router) => {
    router.get('/get/:companyId', logsController.getAllLogs);
    router.use('/create/:id', logsController.create);
    router.post('/PamStartSession',logsController.proxyStartSessionForPam);
    return router;
};
