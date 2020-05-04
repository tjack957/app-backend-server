//Get the connection to Heroku Database
let pool = require('./sql_conn.js')

//We use this create the SHA256 hash
const crypto = require("crypto");

function sendEmail(from, receiver, subj, message) {
 //research nodemailer for sending email from node.
 // https://nodemailer.com/about/
 // https://www.w3schools.com/nodejs/nodejs_email.asp
 //create a burner gmail account
 //make sure you add the password to the environmental variables
 //similar to the DATABASE_URL and PHISH_DOT_NET_KEY (later section of the lab)
 var nodemailer = require('nodemailer');

 var transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: 'groupchatverif@gmail.com',
     pass: 'Hello123#'
   }
 });
 let s = String('<a href="http://app-backend-server.herokuapp.com/demosql/'+receiver+'">Click here to Verify</a>')
 console.log(s);
 console.log(typeof(s));
 var mailOptions = {
   from: 'groupchatverif@gmail.com',
   to: receiver,
   subject: subj,
   html: s
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


module.exports = {
 pool, getHash, sendEmail
} 
