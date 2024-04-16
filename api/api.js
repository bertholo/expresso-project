const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employees');
const menuRouter = require('./menu');


apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menuRouter);

module.exports = apiRouter;