//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())

/**
 * @api {get} /email for all connections
 * @apiName GetContacts
 * @apiGroup Connections
 * 
 * @apiDescription Reqquest to get all the valid emails in the DB.
 * 
 * 
 * @apiSuccess {String[]} String of all valid emails.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.get('/',(request, response) => {
    //perform the Select

    let query = `SELECT email FROM Members where Verification=1`
    
    pool.query(query)
        .then(result => {
            response.send({
                email: result.rows                
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
});

module.exports = router