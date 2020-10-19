var ObjectId = require('mongodb').ObjectId;

const DB = process.env.DB_DATABASE;
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = client.connect();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var collections = ['users','conversations']
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
			if (input._id) {input._id = new ObjectId(input._id)};
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').findOne(
						Object.assign(input, {
							is_deleted:false
						}), (err, res) => {
						resolve(res);
					});
				});
			});
		},
		conversation: (root, input) => {
			if (input._id) {input._id = new ObjectId(input._id)};
			if (input.user_id) {input.user_id = new ObjectId(input.user_id)};
			return new Promise((resolve) => {
				connection.then(async (db) => {
					let user = await new Promise((resolve) => { db.db(DB).collection('users').findOne({_id:input.user_id},(err,res)=>{resolve(res)})})
					if (!user) {throw new Error('Number not registered')}
					db.db(DB).collection('conversations').findOne({
						_id:input._id,
						participants:{ $in : [user.number] }
					},(err, res) => {
						if (!res) {throw new Error('No Result')}
						resolve(res);
					});
				});
			});
		},
		conversations: (root, input) => {
			if (input.user_id) {input.user_id = new ObjectId(input.user_id)};
			return new Promise((resolve) => {
				connection.then(async (db) => {
					let user = await new Promise((resolve) => { db.db(DB).collection('users').findOne({_id:input.user_id},(err,res)=>{resolve(res)})})
					if (!user) {throw new Error('Number not registered')}
					db.db(DB).collection('conversations').find({ participants: { $in : [user.number] }}).toArray((err, res) => {
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
					db.db(DB).collection('users').findOne(
						Object.assign({
								number:input.number
							}, {
								is_deleted:false
							}),
					(err, res) => {
						if (err) throw err;
						resolve(res);
					});
				});
			});
			if (!user) {throw new Error('Number not registered')}
			const valid = bcrypt.compareSync(input.password, user.password)
			if (!valid) {throw new Error('Invalid password')}
			user = await new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').findOneAndUpdate(user, 
						{ $set: { last_login: new Date(), } }, 
						{ returnOriginal: false }, 
						(err, res) => {
							resolve(res.value);
						});
				});
			});

			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
				expiresIn: '2h'
			});

			return{
				token: token,
				user:user
			}


		},
		register: async (root, input) => {
			var command = [];
			Object.keys(input).forEach(function (key) {
				obj = {}; obj[key] = input[key]; command.push(obj)
			});
			var checkExist = await new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').find({ $or: command }).toArray((err, res) => {
						resolve(res);
					});
				});
			});
			if (checkExist.length) {throw new Error('Number been used')}
			if(input.password){input.password = await bcrypt.hash(input.password, 10)};
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').insertOne(
						Object.assign(input, {
							created_at: new Date(),
							updated_at: new Date(),
							last_login: null,
							is_deleted: false
						}), (err, res) => {
							resolve(res.ops[0]);
						});
				});
			});
		},
		deleteUser: async (root, input) => {
			if (input._id) {input._id = new ObjectId(input._id)};
			var user =  await new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').findOne(
						Object.assign({
								_id:input._id
							}, {
								is_deleted:false
							}),
					(err, res) => {
						if (err) throw err;
						resolve(res);
					});
				});
			});
			if (!user) {throw new Error('Number not registered')}
			const valid = bcrypt.compareSync(input.password, user.password);
			if (!valid) {throw new Error('Invalid password')}
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('users').findOneAndUpdate(user, 
						{ $set: { is_deleted: true } }, 
						{ returnOriginal: false }, 
						(err, res) => {
							resolve(res.value.is_deleted);
						});
				});
			});
		},
		createMessage: async (root, input) => {
			let participants = [input.author,input.target].sort();
			return new Promise((resolve) => {
				connection.then((db) => {
					db.db(DB).collection('conversations').findOneAndUpdate(
						{
							participants: participants
						},{
							$push:{
								messages:{
									$each:[
										{
											author:input.author,
											content:input.content,
											created_at :new Date(),
											is_seen:[],
										}
									],
									$position:0
								},
							}
						},
						{ upsert: true, returnOriginal: false },
						 (err, res) => {
							resolve(res.value.messages[0]);
						});
				});
			});
		},
	}
};
