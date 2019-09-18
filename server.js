'use strict'

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const validator = require('validator');

const DB_URI = encodeURIComponent(process.env.DBURI);
const DB_USR = encodeURIComponent(process.env.DBUSER);
const DB_PWD = encodeURIComponent(process.env.DBPWD);
const DB_NME = process.env.DB;

const IS_PROD = process.env.ENVIR === 'PROD';

/** Mongoose Start **/

mongoose.connect(`mongodb://${DB_USR}:${DB_PWD}@${DB_URI}/${DB_NME}`,{useNewUrlParser: true})
  .then(() => {
    console.log('Database connection successful!');
  })
  .catch(err => {console.error('Database connection error!')});

const shortUrl = require('./schemas/shortUrlSchema.js')(mongoose); // Grab the Schema from git submodule

/*** Mongoose End ***/

/** Express Start **/

const app = express();

if(IS_PROD){
  console.log('PROD DETECTED, IMPLEMENTING CSP.');
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
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
  }));
} else console.log('DEV DETECTED, SKIPPING CSP.');

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