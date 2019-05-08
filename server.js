'use strict'

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const dns = require('dns');
const nanoid = require('nanoid');
const validator = require('validator');

const dbUri = encodeURIComponent(process.env.DBURI);
const dbUser = encodeURIComponent(process.env.DBUSER);
const dbPswd = encodeURIComponent(process.env.DBPWD);
const dbAuth = process.env.DBAUTH;
const dbName = process.env.DB;
// const dbUrl = `mongodb://${dbUser}:${dbPswd}@${dbUri}/?authMechanism=${dbAuth}&authSource=${dbName}`;

/** Mongoose Start **/

const mongoose = require('mongoose');

mongoose.connect(`mongodb://${dbUser}:${dbPswd}@${dbUri}/${dbName}`,{useNewUrlParser: true})
  .then(() => {
    console.log('Database connection successful!');
  })
  .catch(err => {console.error('Database connection error!')});

let shortUrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
    unique: true,
    validate: (value) => {return validator.isURL(value)}
  },
  short_id: {
    type: String,
    required: true,
    unique: true
    validate: (value) => {return validator.isAlphanumeric(value)}
  }
});

let userSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

userSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

module.exports = mongoose.model('shortUrl', shortUrlSchema);

/*** Mongoose End ***/

/** MongoDB Start **/

/*

const { MongoClient } = require('mongodb');

MongoClient.connect(dbUrl,{useNewUrlParser: true}).then(client => {console.log("Connected!");client.close();}).catch((err) => console.error(err));

function shortUrl(db, url){return shortUrl(db,url,null)};

function shortUrl(db, url, id){
  const shortdb = db.collection('shortenedURLs');
  if(id){
    return shortenedURLs.findOneAndUpdate(
      { short_id: id },
      { original_url: url, short_id: id },
      { returnOriginal: false, upsert: true }
    );
 }else{
    return shortenedURLs.findOneAndUpdate(
      { original_url: url },
      { $setOnInsert: { original_url: url, short_id: nanoid(8) } },
      { returnOriginal: false, upsert: true }
    );
  }
}
*/

/*** MongoDB End ***/

/** Express Start **/
const app = express();

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(session({
  
}));
app.post('/new',(req,res)=>{console.log(req.body);});
app.set('port',process.env.PORT || 4100);

const server = app.listen(app.get('port'),()=>{console.log(`Express running → PORT ${server.address().port}`);});
/*** Express End ***/