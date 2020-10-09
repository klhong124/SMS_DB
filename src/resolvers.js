var ObjectId = require('mongodb').ObjectId;

const DB = process.env.DB_DATABASE;
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = client.connect();

const bcrypt = require('bcrypt');
//bcrypt.compareSync(myPlaintextPassword, '$2b$10$l5oTN8bD74gbZE5nTE9Y4efIuNMhh2is4DrmgIPp/t3QvD9aQt9LS');

connection.then((db) => {
	db.db(DB).createCollection('users');
	db.db(DB).createCollection('messages');
});

module.exports = {
	Query: {
		user: (root, input) => {
			input._id ? (input._id = new ObjectId(input._id)) : '';
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').findOne(input, (err, res) => {
						resolve(res);
					});
				});
			});
		},
		users: (root, { input }) => {
			var command = [];
			Object.keys(input).forEach(function (key) {
				obj = {}
				obj[key] = input[key]
				command.push(obj)
			});
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').find({ $or: command }).toArray((err, res) => {
						resolve(res);
					});
				});
			});
		}
	},
	Mutation: {
		createUser: async (root, input) => {
			var command = [];
			Object.keys(input).forEach(function (key) {
				obj = {}; obj[key] = input[key]; command.push(obj)
			});
			var checkexist = await new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').find({ $or: command }).toArray((err, res) => {
						resolve(res);
					});
				});
			});
			if (checkexist.length) {
				return null
			}
			input.password ? (input.password = await bcrypt.hash(input.password, 10)) : '';
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').insertOne(
						Object.assign(input, {
							created_at: new Date(),
							updated_at: new Date(),
							last_login: null
						}), (err, res) => {
							resolve(res.ops[0]);
						});
				});
			});
		},
		createMessage: async (root, input) => {
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('messages').insertOne(
						Object.assign(input, {
							created_at: new Date(),
							updated_at: new Date(),
							last_login: null
						}), (err, res) => {
							resolve(res.ops[0]);
						});
				});
			});
		},
	}
};
