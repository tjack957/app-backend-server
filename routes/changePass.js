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
 * @api {get} /changePass/ Request to verify all demo entries in the DB
 * @apiName GetChangePass
 * @apiGroup ChangePass
 * 
 * @apiParam {String} newPass The new password
 * 
 * @apiSuccess {boolean} Password has been changed
 * 
 * @apiError (404: Name Not Found) {String} message "Name not found"
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * 
 */ 
router.get("/",(request, response, next) => {
    const theQuery = "SELECT Password, Salt from Members WHERE email=$1"
    let values = [request.decoded.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                let ourSaltedHash = result.rows[0].password
                console.log(ourSaltedHash)
                let theirSaltedHash = getHash(request.headers['old'], result.rows[0].salt)
                if(ourSaltedHash === theirSaltedHash){
                    next()
                }
                else {
                    console.log("passwords did not match")
                    response.status(404).send({
                        message: "Passwords did not match"
                    })
                }
            } else {
                console.log("Email not found")
                response.status(404).send({
                    message: "Email not found"
                })
            }
        })
        .catch(err => {
            //log the error
            console.log(err.stack)
            console.log(values)
            console.log(theQuery)
            response.status(400).send({
                message: err.stack
            })
        })
},(request, response, next) => {
    const theQuery = "SELECT salt from Members WHERE email=$1"
    let values = [request.decoded.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                request.salt = result.rows[0].salt
                console.log("Password changed")
                response.status(404).send({
                    message: "Password changed"
                })
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
            console.log(err.stack)
            console.log(values)
            console.log(theQuery)
            response.status(400).send({
                message: err.stack
            })
        })
}, (request, response) => {
    let newPass = getHash(request.headers['password'], request.salt)
    const theQuery = "UPDATE members set password=$1 where email=$2"
    let values = [newPass, request.decoded.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                response.send({
                    message: "Password has been changed"
                })
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
