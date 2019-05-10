'use strict'

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const validator = require('validator');

const dbUri = encodeURIComponent(process.env.DBURI);
const dbUser = encodeURIComponent(process.env.DBUSER);
const dbPswd = encodeURIComponent(process.env.DBPWD);
const dbName = process.env.DB;

/** Mongoose Start **/

mongoose.connect(`mongodb://${dbUser}:${dbPswd}@${dbUri}/${dbName}`,{useNewUrlParser: true})
  .then(() => {
    console.log('Database connection successful!');
  })
  .catch(err => {console.error('Database connection error!')});

const shortUrl = require('./schemas/shortUrlSchema.js')(mongoose); // Grab the Schema from git submodule

/*** Mongoose End ***/

/** Express Start **/

const app = express();

app.use(express.static(path.join(__dirname,'public')));

app.get('/:short_id', (req, res) => {
  var shortId = req.params.short_id;
  console.log(shortId);
  if (!validator.isAlphanumeric(shortId)) { 
    console.log("Not Alphanumeric"); 
    res.redirect("/");
  } else {
    shortUrl.findOne({ short_id: `${shortId}` }, 
      (err, shortDoc) => {
        if( shortDoc === null ) { console.log("Not in DB"); res.redirect("/"); } 
        else res.redirect(shortDoc.original_url); 
      }
    );
  }
});

app.set('port',process.env.PORT || 4100);

const server = app.listen(app.get('port'),()=>{console.log(`Express running → PORT ${server.address().port}`);});

/*** Express End ***/