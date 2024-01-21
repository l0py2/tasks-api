const router = require('express').Router();
const { Op } = require('sequelize');

const relationsModule = require('../modules/relations');
const verifyAuth = require('./middleware/auth');
const pagination = require('./middleware/pagination');
const Task = require('../models/Task');

router.get('/auser/tasks', verifyAuth, pagination, async (req, res) => {
	try {
		const like = (req.query.like == null) ? '%' : `${req.query.like}%`;
		const statusValues = (req.query.showdone != null && req.query.showdone == 'true') ? [false, true] : [false];

		const count = await req.user.countTasks({
			where: {
				name: {
					[Op.like]: like
				},
				status: {
					[Op.in]: statusValues
				},
				GroupId: null
			}
		});

		const limit = (req.limit == 0) ? count : req.limit;
		const maxPages = Number.isNaN(count / limit) ? 0 : Math.ceil(count / limit);
		const offset = limit * (req.page - 1);

		const tasks = await req.user.getTasks({
			where: {
				name: {
					[Op.like]: like
				},
				status: {
					[Op.in]: statusValues
				},
				GroupId: null
			},
			offset,
			limit
		});

		res.status(200).json({
			tasks,
			maxPages
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.get('/task/:taskid', verifyAuth, async (req, res) => {
	try {
		const { relation, task } = await relationsModule.userOwnTask(req.params.taskid, req.user.username);

		if(!relation) {
			res.status(403).json({
				message: 'Task not found',
				details: 'This task does not belong to you'
			});
			return;
		}

		delete task.Users;
		delete task.dataValues.Users;

		res.status(200).json({
			task
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.post('/auser/tasks', verifyAuth, async (req, res) => {
	if(req.body.name == null || req.body.start == null || req.body.end == null) {
		res.status(400).json({
			message: 'You need to provide an name, an start and end',
			details: 'Provide an name, an start and end in the request body'
		});
		return;
	}

	const name = req.body.name;
	const start = new Date(req.body.start);
	const end = new Date(req.body.end);
	const description = req.body.description;
	let status = false;

	if(typeof name != 'string' || name.length > 128) {
		res.status(400).json({
			message: 'You need to provide an valid name',
			details: 'Name needs to be a string, less than 128 of length and valid char to an name are: a-z A-Z 0-9 _ -'
		});
		return;
	}

	if(isNaN(start) || isNaN(end) || start > end) {
		res.status(400).json({
			message: 'You need to provide an valid start and end',
			details: 'Start and date needs to be in ISO 8601 format and end date must be greater or equal to the start date'
		});
		return;
	}

	if(description != null) {
		if(typeof description != 'string' || description.length > 65535) {
			res.status(400).json({
				message: 'You need to provide an valid description',
				details: 'Description needs to be a string and less than 65535 of length'
			});
			return;
		}
	}

	if(req.body.status != null) {
		status = req.body.status;

		if(typeof status != 'boolean') {
			res.status(400).json({
				message: 'You need to provide an valid status',
				details: 'Status needs to be a boolean'
			});
			return;
		}
	}

	try {
		const task = await Task.create({
			name,
			description,
			status,
			start,
			end
		});

		await req.user.addTask(task);

		res.status(201).json({
			task
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.patch('/task/:taskid', verifyAuth, async (req, res) => {
	try {
		const { relation, task } = await relationsModule.userOwnTask(req.params.taskid, req.user.username);

		if(!relation) {
			res.status(403).json({
				message: 'Task not found',
				details: 'This task does not belong to you'
			});
			return;
		}

		let changed = false;

		if(req.body.description != null) {
			const description = req.body.description;

			if(typeof description != 'string' || description.length > 65535) {
				res.status(400).json({
					message: 'You need to provide an valid description',
					details: 'Description needs to be a string and less than 65535 character'
				});
				return;
			}

			task.description = description;
			await task.save();
			changed = true;
		}

		if(req.body.status != null) {
			const status = req.body.status;

			if(typeof status != 'boolean') {
				res.status(400).json({
					message: 'You need to provide an valid description',
					details: 'Status needs to be a boolean'
				});
				return;
			}

			task.status = status;
			await task.save();
			changed = true;
		}

		if(req.body.start != null && req.body.end != null) {
			const start = new Date(req.body.start);
			const end = new Date(req.body.end);

			if(isNaN(start) || isNaN(end) || start > end) {
				res.status(400).json({
					message: 'You need to provide an valid start and end',
					details: 'End needs to be in the ISO 8601 format and end needs to be greate or equal than start'
				});
				return;
			}

			task.start = start;
			task.end = end;
			await task.save();
			changed = true;
		}else if(req.body.start != null) {
			const start = new Date(req.body.start);
			const end = new Date(task.end);

			if(isNaN(start) || start > end) {
				res.status(400).json({
					message: 'You need to provide an valid start',
					details: 'Start need to be in the ISO 8601 format and start needs to be lesser or equald than end'
				});
				return;
			}

			task.start = start;
			await task.save();
			changed = true;
		}else if(req.body.end != null) {
			const start = new Date(task.start);
			const end = new Date(req.body.end);

			if(isNaN(end) || start > end) {
				res.status(400).json({
					message: 'You need to provide an valid end',
					details: 'End needs to be in the ISO 8601 format and end needs to be greate or equal than start'
				});
				return;
			}

			task.end = end;
			await task.save();
			changed = true;
		}
		
		if(changed) {
			res.status(200).json({
				message: 'Task updated'
			});
		}else {
			res.status(200).json({
				message: 'Nothing to update for the task',
				details: 'You can update one or more of this values: description, status'
			});
		}
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

module.exports = router;
