//Get the connection to Heroku Database
let pool = require('./sql_conn.js')

//We use this create the SHA256 hash
const crypto = require("crypto");

function sendEmail(from, receiver, subj, message) {
 var nodemailer = require('nodemailer');

 var transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: process.env.HOST,
     pass: process.env.PASSWORD
   }
 });
 let verifyString = String('<a href="http://app-backend-server.herokuapp.com/verify/'+message+'">Click here to Verify</a>')
 var mailOptions = {
   from: 'groupchatverif@gmail.com',
   to: receiver,
   subject: subj,
   html: verifyString
 };
 
 transporter.sendMail(mailOptions, function(error, info){
   if (error) {
     console.log(error);
   } else {
     console.log('Email sent: ' + info.response);
   }
 });
}

function sendEmail2(from, receiver, subj, message) {
  var nodemailer = require('nodemailer');
 
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.HOST,
      pass: process.env.PASSWORD
    }
  });
  let verifyString = String('<a href="http://app-backend-server.herokuapp.com/reset/'+message+'">Click here to reset your password</a>')
  var mailOptions = {
    from: 'groupchatverif@gmail.com',
    to: receiver,
    subject: subj,
    html: verifyString
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
 }

 function sendEmail3(from, receiver, subj, message) {
  var nodemailer = require('nodemailer');
 
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.HOST,
      pass: process.env.PASSWORD
    }
  });
  let verifyString = String('Your password has been reset, your temporary password is:' + message)
  var mailOptions = {
    from: 'groupchatverif@gmail.com',
    to: receiver,
    subject: subj,
    html: verifyString
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
 }

/**
 * Method to get a salted hash.
 * We put this in its own method to keep consistency
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
function getHash(pw, salt) {
 return crypto.createHash("sha256").update(pw + salt).digest("hex");
}

let messaging = require('./pushy_utilities.js')
module.exports = {
 pool, getHash, sendEmail, sendEmail2,sendEmail3, messaging
} 
