//express is the framework we're going to use to handle requests
const express = require('express')

var router = express.Router()

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json())
 
let pool = require('../utilities/utils').pool

/**
 * @api {get} /verify/:name? Request to verify all demo entries in the DB
 * @apiName GetVerify
 * @apiGroup Verify
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
router.get("/:name?", (request, response) => {

    const theQuery = "UPDATE members SET verification=1 WHERE username LIKE $1"
    let values = [request.params.name]

    //No name was sent so SELECT on all
    if(!request.params.name)
        values = ["%"]

    pool.query(theQuery, values)
        .then(result => {
            if (result.rowCount > 0) {
                response.send({
                    success: true,
                    names: result.rows
                })
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
