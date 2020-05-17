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
 * @api {get} /changePass/:newPass? Request to verify all demo entries in the DB
 * @apiName GetChangePass
 * @apiGroup ChangePass
 * 
 * @apiParam {String} newPass The new password
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
router.get("/:newPass?",(request, response, next) => {
    const theQuery = "SELECT salt from Members WHERE MemberId=$1"
    //let values = []
    let values = [request.decoded.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                console.log("THIS IS THE SALT: " + result.rows[0].salt)
                request.salt = result.row[0].salt
                next()
            } else {
                console.log("Name not found")
                response.status(404).send({
                    message: "Name not found"
                })
            }
        })
        .catch(err => {
            //log the error
            console.log(values)
            console.log(theQuery)
            console.log(err.stack)
            response.status(400).send({
                message: err.stack
            })
        })
}, (request, response) => {
    let newPass = getHash(request.headers['password'], request.salt)
    console.log("THIS IS THE NEW PASS" + request.headers['password'])
    console.log("THIS IS THE SALT V2" +  request.salt)
    const theQuery = "UPDATE members set password=$1 where email=$2"
    let values = [newPass, request.decoded.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                console.log("Worked" + result)
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