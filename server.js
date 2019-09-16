'use strict'

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const validator = require('validator');

const dbUri = encodeURIComponent(process.env.DBURI);
const dbUser = encodeURIComponent(process.env.DBUSER);
const dbPswd = encodeURIComponent(process.env.DBPWD);
const dbName = process.env.DB;

const isProd = process.env.ENVIR === 'PROD';

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

if(isProd){
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    directives: {
      baseUri: ["'self'"],
      defaultSrc: ["'none'"],
      styleSrc: ["'self'"],
      frameAncestors:["'none'"],
      formAction: ["'none'"]
    }
  }));
  app.use(helmet.referrerPolicy({
    policy: ['no-referrer']
  }));
  app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }));
}

app.use(express.static(path.join(__dirname,'public')));

app.get('/:short_id', (req, res) => {
  var shortId = req.params.short_id;
  if (!validator.isAlphanumeric(shortId)) { 
    res.redirect("/");
  } else {
    shortUrl.findOne({ short_id: `${shortId}` }, 
      (err, shortDoc) => {
        if( shortDoc === null ) res.redirect("/");
        else res.redirect(shortDoc.original_url); 
      }
    );
  }
});

app.set('port',process.env.PORT || 4100);

const server = app.listen(app.get('port'),()=>{console.log(`Express running → PORT ${server.address().port}`);});

/*** Express End ***/