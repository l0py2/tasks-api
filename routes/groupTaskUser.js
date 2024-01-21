const router = require('express').Router();
const { Op } = require('sequelize');

const authModule = require('../modules/auth');
const relationsModule = require('../modules/relations');
const verifyAuth = require('./middleware/auth');
const pagination = require('./middleware/pagination');
const User = require('../models/User');
const Group = require('../models/Group');
const Task = require('../models/Task');

router.get('/group/:groupname/tasks', verifyAuth, pagination, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role !=0 && role != 1) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be a member of the group'
			});
			return;
		}

		const like = (req.query.like == null) ? '%' : `${req.query.like}%`;
		const statusValues = (req.query.showdone != null && req.query.showdone == 'true') ? [false, true] : [false];

		const count = await group.countTasks({
			where: {
				name: {
					[Op.like]: like
				},
				status: {
					[Op.in]: statusValues
				}
			}
		});

		const limit = (req.limit == 0) ? count : req.limit;
		const maxPages = Number.isNaN(count / limit) ? 0 : Math.ceil(count / limit);
		const offset = limit * (req.page - 1);

		const tasks = await group.getTasks({
			where: {
				name: {
					[Op.like]: like
				},
				status: {
					[Op.in]: statusValues
				}
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

router.get('/group/:groupname/auser/tasks', verifyAuth, pagination, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role !=0 && role != 1) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be a member of the group'
			});
			return;
		}

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
				GroupId: group.id
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
				GroupId: group.id
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

router.get('/group/:groupname/task/:taskid', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0 && role != 1) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be in the group'
			});
			return;
		}

		const { relation, task } = await relationsModule.groupOwnTask(req.params.taskid, group.id);

		if(!relation) {
			res.status(403).json({
				message: 'Task not found',
				details: 'This task does not belong to your group'
			});
			return;
		}

		res.status(200).json({
			task,
			owns: await task.hasUser(req.user)
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.get('/group/:groupname/task/:taskid/users', verifyAuth, pagination, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0 && role != 1) {
			res.status(403).json({
				message: 'Group not found',
				detasil: 'You need to be a member of the group with role 0 or 1'
			});
			return;
		}

		const { relation, task } = await relationsModule.groupOwnTask(req.params.taskid, group.id);

		if(!relation) {
			res.status(403).json({
				message: 'Task not found',
				details: 'This task does not belong to your group'
			});
			return;
		}

		const like = (req.query.like == null) ? '%' : `${req.query.like}%`;

		const count = await task.countUsers({
			where: {
				username: {
					[Op.like]: like
				}
			}
		});

		const limit = (req.limit == 0) ? count : req.limit;
		const maxPages = Number.isNaN(count / limit) ? 0 : Math.ceil(count / limit);
		const offset = limit * (req.page - 1);

		const users = await task.getUsers({
			where: {
				username: {
					[Op.like]: like
				}
			},
			offset,
			limit,
			attributes: authModule.attributes
		});

		res.status(200).json({
			users,
			maxPages
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.get('/not/group/:groupname/task/:taskid/users', verifyAuth, pagination, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0 && role != 1) {
			res.status(403).json({
				message: 'Group not found',
				detasil: 'You need to be a member of the group with role 0 or 1'
			});
			return;
		}

		const { relation, task } = await relationsModule.groupOwnTask(req.params.taskid, group.id);

		if(!relation) {
			res.status(403).json({
				message: 'Task not found',
				details: 'This task does not belong to your group'
			});
			return;
		}

		const taskUsers = await task.getUsers({
			attributes: ['id']
		});

		const groupUsers = await group.getUsers({
			attributes: ['id']
		});

		const invalidId = [];
		for(let i = 0; i < taskUsers.length; i++) {
			invalidId.push(taskUsers[i].id);
		}

		const validId = [];
		for(let i = 0; i < groupUsers.length; i++) {
			if(invalidId.indexOf(groupUsers[i].id) == -1) {
				validId.push(groupUsers[i].id);
			}
		}

		const like = (req.query.like == null) ? '%' : `${req.query.like}%`;

		const count = await group.countUsers({
			where: {
				username: {
					[Op.like]: like
				},
				id: {
					[Op.in]: validId
				}
			}
		});

		const limit = (req.limit == 0) ? count : req.limit;
		const maxPages = Number.isNaN(count / limit) ? 0 : Math.ceil(count / limit);
		const offset = limit * (req.page - 1);

		const users = await group.getUsers({
			where: {
				username: {
					[Op.like]: like
				},
				id: {
					[Op.in]: validId
				}
			},
			offset,
			limit,
			attributes: authModule.attributes
		});

		res.status(200).json({
			users,
			maxPages
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.post('/group/:groupname/tasks', verifyAuth, async (req, res) => {
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
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be a member the group with role 0'
			});
			return;
		}

		const task = await Task.create({
			name,
			description,
			status,
			start,
			end
		});

		await group.addTask(task);

		res.status(201).json({
			task
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.post('/group/:groupname/task/:taskid/users', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be a member of the group with role 0'
			});
			return;
		}

		const { relation, task } = await relationsModule.groupOwnTask(req.params.taskid, group.id);

		if(!relation) {
			res.status(403).json({
				message: 'Task not found',
				details: 'This task does not belong to your group'
			});
			return;
		}

		if(req.body.username == null) {
			res.status(400).json({
				message: 'Youn need to provide an username',
				details: 'You need to provide an username in the rquest body'
			});
			return;
		}

		const username = req.body.username;

		const newUser = await User.findOne({
			where: {
				username
			},
			include: {
				model: Group,
				where: {
					id: group.id
				},
				through: {
					where: {
						role: {
							[Op.ne]: 2
						}
					}
				}
			},
			attributes: authModule.attributes
		});

		if(newUser == null) {
			res.status(404).json({
				message: 'User not found',
				details: 'User is not an member of the group'
			});
			return;
		}

		if(await task.hasUser(newUser)) {
			res.status(403).json({
				message: 'User not found',
				details: 'User already has this task'
			});
			return;
		}

		await task.addUser(newUser);

		res.status(201).json({
			message: 'Task added to the user'
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.patch('/group/:groupname/task/:taskid', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0 && role != 1) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be a member of the group with role 0 or 1'
			});
			return;
		}

		const { relation, task } = await relationsModule.groupOwnTask(req.params.taskid, group.id);

		if(!relation) {
			res.status(403).json({
				message: 'Task not found',
				details: 'This task does not belong to your group'
			});
			return;
		}

		let changed = false;

		if(role == 0 && req.body.description != null) {
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

		if((role == 0 || await task.hasUser(req.user)) && req.body.status != null) {
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

		if(role == 0 && req.body.start != null && req.body.end != null) {
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
		}else if(role == 0 && req.body.start != null) {
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
		}else if(role == 0 && req.body.end != null) {
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
