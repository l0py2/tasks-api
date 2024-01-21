const express = require('express');
const cors = require('cors');
require('dotenv').config();

const config = require('./config');
const sequelize = require('./database');
const User = require('./models/User');
const Group = require('./models/Group');
const Task = require('./models/Task');
const GroupUser = require('./models/GroupUser');
const TaskUser = require('./models/TaskUser');
const routes = require('./routes/main');

Group.belongsToMany(User, {
	through: GroupUser
});
User.belongsToMany(Group, {
	through: GroupUser
});

Group.hasMany(Task);
Task.belongsTo(Group);

Task.belongsToMany(User, {
	through: TaskUser
});
User.belongsToMany(Task, {
	through: TaskUser
});

sequelize.sync(config.database.sync);

const app = express();
const port = config.app.port;

app.set('query parser', 'simple');
app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
