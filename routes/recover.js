//express is the framework we're going to use to handle requests
const express = require('express')

var router = express.Router()

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json())
let sendEmail2 = require('../utilities/utils').sendEmail2
let pool = require('../utilities/utils').pool
let jwt = require('jsonwebtoken');
let config = {
    secret: process.env.JSON_WEB_TOKEN
};


/**
 * @api {get} /recover/:email? Request to verify all demo entries in the DB
 * @apiName GetVerify
 * @apiGroup Verify
 * 
 * @apiParam {String} email The email the recovery code will be sent to
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
router.get("/:email?",(request, response) => {
    const theQuery = "SELECT email from members WHERE email=$1"
    let values = [request.params.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                let token = jwt.sign(
                    {
                        "email": result.rows[0].email
                    },
                    config.secret,
                    { 
                        expiresIn: '14 days' // expires in 24 hours
                    }
                )
                sendEmail2("uwnetid@uw.edu", result.rows[0].email, "Reset your password", token)
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