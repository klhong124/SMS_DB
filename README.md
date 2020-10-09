# SMS_DB

#project init
npm install apollo-server graphql apollo-server-lambda dotenv mongodb

#_redirects
/ /.netlify/functions/index 200!

#production
form src.* clone to functions/
run functions/index.js