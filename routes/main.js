const router = require('express').Router();

const auth = require('./auth');
const groupUser = require('./groupUser');
const taskUser = require('./taskUser');
const groupTaskUser = require('./groupTaskUser');

router.get('/', (req, res) => {
	res.status(200).json({
		message: 'Main route'
	});
});

router.use(auth);
router.use(groupUser);
router.use(taskUser);
router.use(groupTaskUser);

module.exports = router;
