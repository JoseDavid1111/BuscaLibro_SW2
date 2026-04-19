const { Router } = require('express');
const { login, me } = require('./auth.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { validateBody } = require('../../middlewares/validate.middleware');
const { loginSchema } = require('./auth.schema');

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.get('/me', verifyToken, me);

module.exports = router;
