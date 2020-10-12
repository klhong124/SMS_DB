var ObjectId = require('mongodb').ObjectId;

const DB = process.env.DB_DATABASE;
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = client.connect();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var collections = ['users','messages']
connection.then(async (db) => {
	var exist = await db.db(DB).listCollections().toArray();
	var array = [];
	for (var i in exist) {
		array.push(exist[i]['name'])
	}
	for (var i in collections){
		if(!array.includes(collections[i])){
			db.db(DB).createCollection(collections[i]);
		}
	} 
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
		users: (root, {input}) => {
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
		},
		messagesforTEST: () => {
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('messages').find().toArray((err, res) => {
						resolve(res);
					});
				});
			});
		}
	},
	Mutation: {
		login: async (root,input)=>{
			var user =  await new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').findOne({number:input.number},
					(err, res) => {
						if (err) throw err;
						resolve(res);
					});
				});
			});
			const valid = bcrypt.compareSync(input.password, user.password)
			if (!valid) {
				throw new Error('Invalid password')
			}
			user =  new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').findOneAndUpdate({number:input.number}, 
						{ $set: { last_login: new Date(), } }, 
						{ returnOriginal: false }, 
						(err, res) => {
							resolve(res.value);
						});
				});
			});

			const token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
				expiresIn: '2h'
			});

			return{
				token: token,
				user:user
			}


		},
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
							is_seen: false,
							seen_at:null,
						}), (err, res) => {
							resolve(res.ops[0]);
						});
				});
			});
		},
	}
};
