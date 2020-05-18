//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())

/**
 * @api {get} /connections/:sender? for all connections
 * @apiName GetContacts
 * @apiGroup Connections
 * 
 * @apiDescription Reqquest to get all the valid emails in the DB.
 * 
 * @apiParam {String} sender the email to look up. 
 * @apiSuccess {String[]} String of all valid emails.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.get("/:email?", (request, response) => {
    //perform the Select
    console.log("MADE IT")
    let query = `select Members.email
	            from Members
	            Where Members.memberid IN

                (Select contacts.memberid_b
	            from Contacts
	            Where contacts.memberid_a =

                (select Members.memberid
                From Members
                Where Members.email=$1))`

    let values=  [request.body.email]
    console.log(values)
    pool.query(query, values)
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


/**
 * @api {post} /connections/:sender? for all connections
 * @apiName PostContacts
 * @apiGroup Connections
 * 
 * @apiDescription Request to create a new connection.
 * 
 * @apiParam {String} sender the email to look up. 
 * @apiSuccess {String[]} String of all valid emails.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.post("/", (request, response) => {
    //perform the Select
    console.log("MADE IT2")
    let insert = `  Insert into
	                Contacts(MemberID_A, MemberID_B, Verified)
                    VALUES(
                    (Select
	                    Members.MemberID
                        From Members
                        Where Members.Email=$1),

                    (SELECT
                        Members.MemberID
                        From Members
                        Where Members.Email=$2),

                    (SELECT
                        Members.verification
                        From Members
                        Where Members.email=$2));`

    let values=  [request.body.sender, request.body.reciever]
    console.log(values)
    pool.query(insert, values)
        .then(result => {
            response.send({
                message: "INSERT SUCCESS!"            
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
});

/**
 * @api {delete} /connections/:sender? for all connections
 * @apiName PostContacts
 * @apiGroup Connections
 * 
 * @apiDescription Request to create a new connection.
 * 
 * @apiParam {String} sender the email to look up. 
 * @apiSuccess {String[]} String of all valid emails.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.delete("/", (request, response) => {
    //perform the Select
    console.log("MADE IT3")
    let insert = `  delete 
                    from contacts
                    where   contacts.memberid_a =
                            (select Members.memberid
                            From Members
                            Where Members.email=$1)
                    AND
                            contacts.memberid_b = 
                            (select Members.memberid
                            From Members
                            Where Members.email=$2);`

    let values=  [request.body.sender, request.body.reciever]
    console.log(values)
    pool.query(insert, values)
        .then(result => {
            response.send({
                message: "DELETE SUCCESS!"            
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
});

module.exports = router