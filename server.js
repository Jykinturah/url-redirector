'use strict'

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const dbUri = encodeURIComponent(process.env.DBURI);
const dbUser = encodeURIComponent(process.env.DBUSER);
const dbPswd = encodeURIComponent(process.env.DBPWD);
const dbAuth = process.env.DBAUTH;
const dbName = process.env.DB;
// const dbUrl = `mongodb://${dbUser}:${dbPswd}@${dbUri}/?authMechanism=${dbAuth}&authSource=${dbName}`;

/** Mongoose Start **/

mongoose.connect(`mongodb://${dbUser}:${dbPswd}@${dbUri}/${dbName}`,{useNewUrlParser: true})
  .then(() => {
    console.log('Database connection successful!');
  })
  .catch(err => {console.error('Database connection error!')});

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

app.get('/:short_id', (req, res) => {
  const shortId = req.params.short_id;
});


app.set('port',process.env.PORT || 4100);

const server = app.listen(app.get('port'),()=>{console.log(`Express running → PORT ${server.address().port}`);});
/*** Express End ***/