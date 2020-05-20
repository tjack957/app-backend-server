//express is the framework we're going to use to handle requests
const express = require('express')

var router = express.Router()

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json())
let sendEmail = require('../utilities/utils').sendEmailConfirm
let pool = require('../utilities/utils').pool
let jwt = require('jsonwebtoken');
let config = {
    secret: process.env.JSON_WEB_TOKEN
};


/**
 * @api {get} /recover/:email? Request to recover the account of the email provided
 * @apiName GetVerify
 * @apiGroup Verify
 * 
 * @apiParam {String} email The email the recovery code will be sent to
 * 
 * @apiSuccess {boolean} success true when the name is verified
 * 
 * @apiError (404: Name Not Found) {String} message "Name not found"
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * 
 */ 
router.get("/:email?",(request, response) => {
    console.log("**************YOU HAVE CALLED RECOVER*****************")
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
                sendEmail("uwnetid@uw.edu", result.rows[0].email, "Reset your password", token)
                response.send({message: "worked"})
            } else {
                console.log("Name not Found")
                response.status(404).send({
                    message: "Name not found"
                })
            }
        })
        .catch(err => {
            //log the error
            // console.log(err.details)
            console.log(err.stack);
            response.status(400).send({
                message: err.detail
            })
        })
})

module.exports = router