const router = require('express').Router();
const { Op } = require('sequelize');

const authModule = require('../modules/auth');
const relationsModule = require('../modules/relations');
const verifyAuth = require('./middleware/auth');
const pagination = require('./middleware/pagination');
const User = require('../models/User');
const Group = require('../models/Group');
const GroupUser = require('../models/GroupUser');

router.get('/auser/groups', verifyAuth, pagination, async (req, res) => {
	try {
		const like = (req.query.like == null) ? '%' : `${req.query.like}%`;

		const count = await req.user.countGroups({
			where: {
				name: {
					[Op.like]: like
				}
			},
			through: {
				where: {
					role: {
						[Op.ne]: 2
					}
				}
			}
		});

		const limit = (req.limit == 0) ? count : req.limit;
		const maxPages = Number.isNaN(count / limit) ? 0 : Math.ceil(count / limit);
		const offset = limit * (req.page - 1);

		const groups = await req.user.getGroups({
			where: {
				name: {
					[Op.like]: like
				}
			},
			through: {
				where: {
					role: {
						[Op.ne]: 2
					}
				}
			},
			offset,
			limit
		});

		res.status(200).json({
			groups,
			maxPages
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.get('/auser/groups/invites', verifyAuth, pagination, async (req, res) => {
	try {
		const like = (req.query.like == null) ? '%' : `${req.query.like}%`;

		const count = await req.user.countGroups({
			where: {
				name: {
					[Op.like]: like
				}
			},
			through: {
				where: {
					role: 2
				}
			}
		});

		const limit = (req.limit == 0) ? count : req.limit;
		const maxPages = Number.isNaN(count / limit) ? 0 : Math.ceil(count / limit);
		const offset = limit * (req.page - 1);

		const groups = await req.user.getGroups({
			where: {
				name: {
					[Op.like]: like
				}
			},
			through: {
				where: {
					role: 2
				}
			},
			offset,
			limit
		});

		res.status(200).json({
			groups,
			maxPages
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

/* This is here and not in routes/group.js beacause uses the relation between Group and User */
router.get('/group/:groupname', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role == null || role == 2) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be a member of the group'
			});
			return;
		}

		res.status(200).json({
			group
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.get('/group/:groupname/users', verifyAuth, pagination, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role == null || role == 2) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to a member of the group'
			});
			return;
		}

		const like = (req.query.like == null) ? '%' : `${req.query.like}%`;

		const count = await group.countUsers({
			where: {
				username: {
					[Op.like]: like
				}
			},
			through: {
				where: {
					role: {
						[Op.ne]: 2
					}
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
				}
			},
			through: {
				where: {
					role: {
						[Op.ne]: 2
					}
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

router.get('/not/group/:groupname/users', verifyAuth, pagination, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role == null || role == 2) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be a member of the group'
			});
			return;
		}

		const groupUsers = await GroupUser.findAll({
			where: {
				GroupId: group.id
			},
			group: 'UserId'
		});

		const allUsers = await User.findAll({
			attributes: ['id']
		});

		const invalidId = [];
		for(let i = 0; i < groupUsers.length; i++) {
			invalidId.push(groupUsers[i].UserId);
		}

		const validId = [];
		for(let i = 0; i < allUsers.length; i++) {
			if(invalidId.indexOf(allUsers[i].id) == -1) {
				validId.push(allUsers[i].id);
			}
		}

		const like = (req.query.like == null) ? '%' : `${req.query.like}%`;

		const count = await User.count({
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

		const users = await User.findAll({
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

router.get('/group/:groupname/user/:username', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role == null || role == 2) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be member of the group'
			});
			return;
		}

		const userRole = await relationsModule.userRole(group.name, req.params.username);

		if(userRole.role == null) {
			res.status(404).json({
				message: 'User not found',
				details: 'User needs to be a member of the group'
			});
			return;
		}

		res.status(200).json({
			relation: userRole.group.Users[0].GroupUser
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.post('/auser/groups', verifyAuth, async (req, res) => {
	if(req.body.name == null) {
		res.status(400).json({
			message: 'You need to provide an name',
			details: 'Provide an name in the request body'
		});
		return;
	}

	const name = req.body.name;
	const description = req.body.description;

	if(typeof name != 'string' || !authModule.validName.test(name) || name.length > 128) {
		res.status(400).json({
			message: 'You need to provide an valid name value',
			details: 'Name needs to be a string, less than 128 of length and valid chararcters are: a-z A-Z 0-9 _ -'
		});
		return;
	}

	if(description != null) {
		if(typeof description != 'string' || description.length > 65535) {
			res.status(400).json({
				message: 'You need to provide an valid description',
				details: 'Description needs to be a string and less than 65535 character of length'
			});
			return;
		}
	}

	try {
		const group = await Group.create({
			name,
			description
		});

		await req.user.addGroup(group, {
			through: {
				role: 0
			}
		});

		res.status(201).json({
			group
		});
	}catch(error) {
		if(error.name = 'SequelizeUniqueConstraintError') {
			res.status(400).json({
				message: 'You need to provide an valid name',
				details: 'Name already in use'
			});
			return;
		}else {
			res.status(500).json({
				message: 'Internal error'
			});
		}
	}
});

router.post('/group/:groupname/users', verifyAuth, async (req, res) => {
	if(req.body.username == null) {
		res.status(400).json({
			message: 'You need to provide an username',
			details: 'Provide an username in the request body'
		});
		return;
	}

	const username = req.body.username;

	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be a member of the group with role 0'
			});
			return;
		}

		const user = await User.findOne({
			where: {
				username
			},
			attributes: authModule.attributes
		});

		if(user == null) {
			res.status(404).json({
				message: 'User not found',
				details: 'User with that username does not exists'
			});
			return;
		}

		if(await group.hasUser(user)) {
			res.status(400).json({
				message: 'User not found',
				details: 'User already in the group'
			});
			return;
		}

		await group.addUser(user, {
			through: {
				role: 2
			}
		});

		res.status(201).json({
			message: 'User added to the group'
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

/* This route should only be used to accept an Group invite */
router.patch('/group/:groupname/auser', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 2) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be in the group with role 2'
			});
			return;
		}

		const groupUser = await GroupUser.findOne({
			where: {
				GroupId: group.id,
				UserId: req.user.id
			}
		});

		let changed = false;

		if(req.body.role != null) {
			const role = req.body.role;

			if(typeof role != 'number' || role != 1) {
				res.status(400).json({
					nessage: 'You need to provide an valid role value',
					details: 'Role must be an number and valid numbers are: 1'
				});
				return;
			}

			groupUser.role = role;
			await groupUser.save();
			changed = true;
		}

		if(changed) {
			res.status(200).json({
				message: 'User relation with group updated'
			});
		}else {
			res.status(200).json({
				message: 'Nothing to update',
				details: 'You can update by providing an value like: role'
			});
		}
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.patch('/group/:groupname', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be in the group with role 0'
			});
			return;
		}

		let changed = false;

		if(req.body.description != null) {
			const description = req.body.description;

			if(typeof description != 'string' || description.length > 65535) {
				res.status(400).json({
					message: 'Must provide an valid description',
					details: 'Description must be a string and less than 65535 character of length'
				});
				return;
			}

			group.description = description;
			await group.save();
			changed = true;
		}
		
		if(changed) {
			res.status(200).json({
				message: 'Group updated'
			});
		}else {
			res.status(200).json({
				message: 'Nothing to updatef for the group',
				details: 'Must update one or more of this values: description'
			});
		}
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
})

router.patch('/group/:groupname/user/:username', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be in the group with role 0'
			});
			return;
		}

		const user = await User.findOne({
			where: {
				username: req.params.username
			},
			attributes: authModule.attributes
		});

		if(user == null) {
			res.status(404).json({
				message: 'User not found',
				details: 'User with that username does not exists'
			});
			return;
		}

		const groupUser = await GroupUser.findOne({
			where: {
				GroupId: group.id,
				UserId: user.id,
				role: {
					[Op.ne]: 2
				}
			}
		});

		if(groupUser == null) {
			res.status(404).json({
				message: 'User not found',
				details: 'User must be in the group'
			});
			return;
		}

		let changed = false;

		if(req.body.role != null) {
			const role = req.body.role;

			if(typeof role != 'number' || (role != 0 && role != 1)) {
				res.status(400).json({
					message: 'Must provide an valid role',
					details: 'Role must be number and valid numbers are: 0 and 1'
				});
				return;
			}

			groupUser.role = role;
			await groupUser.save();
			changed = true;
		}
		
		if(changed) {
			res.status(200).json({
				message: 'User relation with group updated'
			});
		}else {
			res.status(200).json({
				message: 'Nothing to update for the user relation with group',
				details: 'Must update one or more of this values: role'
			});
		}
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

/* This route should only be used to decline an Group invite */
router.delete('/group/:groupname/auser', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 2) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be in the group with role 2'
			});
			return;
		}

		const groupUser = await GroupUser.findOne({
			where: {
				GroupId: group.id,
				UserId: req.user.id
			}
		});

		await groupUser.destroy();

		res.status(200).json({
			message: 'User relation with group deleted',
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

router.delete('/group/:groupname/user/:username', verifyAuth, async (req, res) => {
	try {
		const { role, group } = await relationsModule.userRole(req.params.groupname, req.user.username);

		if(role != 0) {
			res.status(403).json({
				message: 'Group not found',
				details: 'You need to be in the group with role 0'
			});
			return;
		}

		const user = await User.findOne({
			where: {
				username: req.params.username
			},
			attributes: authModule.attributes
		});

		if(!user) {
			res.status(404).json({
				message: 'User not found',
				details: 'User with that username does not exists'
			});
			return;
		}

		const groupUser = await GroupUser.findOne({
			where: {
				GroupId: group.id,
				UserId: user.id,
				role: {
					[Op.ne]: 2
				}
			}
		});

		if(groupUser == null) {
			res.status(404).json({
				message: 'User not found',
				details: 'User needs to be in the group'
			});
			return;
		}

		await groupUser.destroy();

		res.status(200).json({
			message: 'User relation with group deleted'
		});
	}catch(error) {
		res.status(500).json({
			message: 'Internal error'
		});
	}
});

module.exports = router;
