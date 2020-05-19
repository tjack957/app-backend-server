//express is the framework we're going to use to handle requests
const express = require('express')

var router = express.Router()

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json())
let sendEmail = require('../utilities/utils').sendEmail
let pool = require('../utilities/utils').pool
let jwt = require('jsonwebtoken');
let config = {
    secret: process.env.JSON_WEB_TOKEN
};


/**
 * @api {get} /reverify/:name? Request to verify all demo entries in the DB
 * @apiName GetReverify
 * @apiGroup Reverify
 * 
 * @apiParam {String} name The email that is to be verified
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
router.get("/:email",(request, response, next) => {
    const theQuery = "SELECT Verification from Members WHERE email=$1"
    let values = [request.params.email]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                if(result.rows[0].verification == 0){
                    let token = jwt.sign(
                        {
                            "email": request.params.email
                        },
                        config.secret,
                        { 
                            expiresIn: '14 days' // expires in 24 hours
                        }
                    )
                    sendEmail("uwnetid@uw.edu", request.params.email, "Welcome!", token);
                    res.status(201).send({
                        success: true
                    })
                }
                else {
                    response.status(404).send({
                        message: "Email already verified"
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
})


module.exports = router