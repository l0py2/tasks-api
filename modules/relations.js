/*
 * Collection of function to help with relations
 */

const authModule = require('./auth');
const User = require('../models/User');
const Group = require('../models/Group');
const Task = require('../models/Task');

async function userRole(groupname, username) {
	try {
		const group = await Group.findOne({
			where: {
				name: groupname
			},
			include: {
				model: User,
				where: {
					username
				},
				attributes: authModule.attributes,
				required: true,
			}
		});

		if(group == null) {
			return {
				role: null,
				group: null
			};
		}

		const role = group.Users[0].GroupUser.role;

		return {
			role,
			group
		};
	}catch(error) {
		return {
			role: null,
			group: null
		};
	}
}

async function userOwnTask(taskid, username) {
	try {
		const task = await Task.findOne({
			where: {
				id: taskid,
				GroupId: null
			},
			include: {
				model: User,
				where: {
					username
				},
				attributes: authModule.attributes,
				required: true,
			}
		});

		if(task == null) {
			return {
				relation: false,
				task: null
			};
		}else {
			return {
				relation: true,
				task
			};
		}
	}catch(error) {
		return {
			relation: false,
			task: null
		};
	}
}

async function groupOwnTask(taskid, groupid) {
	try {
		const task = await Task.findOne({
			where: {
				id: taskid,
				GroupId: groupid
			}
		});

		if(task == null) {
			return {
				relation: false,
				task: null
			};
		}else {
			return {
				relation: true,
				task
			};
		}
	}catch(error) {
		return {
			relation: false,
			task: null
		}
	}
}

module.exports = {
	userRole,
	userOwnTask,
	groupOwnTask
};
