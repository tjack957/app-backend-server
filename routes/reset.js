//express is the framework we're going to use to handle requests
const express = require('express')

var router = express.Router()

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json())
let getHash = require('../utilities/utils').getHash 
let pool = require('../utilities/utils').pool
let jwt = require('jsonwebtoken');
let config = {
    secret: process.env.JSON_WEB_TOKEN
};


/**
 * @api {get} /reset/:token? Request to verify all demo entries in the DB
 * @apiName GetVerify
 * @apiGroup Verify
 * 
 * @apiParam {String} token The email that is to be verified
 * 
 * @apiSuccess {boolean} success true when the name is verified
 * @apiSuccess {Object[]} names List of names in the Demo DB
 * @apiSuccess {String} names.name The name
 * @apiSuccess {String} names.message The message asscociated with the name
 * 
 * @apiError (404: Name Not Found) {String} message "Name not found"
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * 
 */ 
router.get("/:token?",(req, res, next) => {
    let token = req.params.token
    if (token) {
      if (token.startsWith('Bearer ')) {
          // Remove Bearer from string
          token = token.slice(7, token.length);
      }
  
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'Token is not valid'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Auth token is not supplied'
      });
    }
  }, (request, response, next) => {
    const theQuery = "SELECT salt from members WHERE email=$1"
    let values = [request.decoded.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                request.salt = result.rows[0]
                next()
            } else {
                response.status(404).send({
                    message: "Name not found"
                })
            }
        })
        .catch(err => {
            //log the error
            // console.log(err.details)
            response.status(400).send({
                message: err.detail
            })
        })
}, (request, response) => {
    let salted_hash = getHash(password, salt)
    const theQuery = "UPDATE members SET password=$1 WHERE email=$2"
    let values = [request.salt, request.decoded.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                sendEmail3("uwnetid@uw.edu", result.rows[0].email, "Reset your password", "token")
            } else {
                response.status(404).send({
                    message: "Name not found"
                })
            }
        })
        .catch(err => {
            //log the error
            // console.log(err.details)
            response.status(400).send({
                message: err.detail
            })
        })
})


module.exports = router