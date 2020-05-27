//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())

/**
 * @api {get} / Search for usernames with a similar name to that provided
 * @apiName GetContacts
 * @apiGroup Connections
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiDescription Reqquest to get all the valid emails in the DB.
 * 
 * @apiSuccess {String[]} String of all valid emails.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.get("/:toSearch", (request, response) => {
    //perform the Select
    console.log("MADE IT")
    let query = `select username from members where username like $1 or firstname like $1`
    let val = "%"+request.params.toSearch+"%"
    let values=  [val]
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
 * @api {post} / Read all existing connections for a user
 * @apiName PostContacts
 * @apiGroup Connections
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiDescription Reqquest to get all the valid emails in the DB.
 * 
 * @apiSuccess {String[]} String of all valid emails.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.post("/", (request, response) => {
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

    let values=  [request.decoded.email]
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
 * @api {put} / Create a new Contact for a user.
 * @apiName PutContacts
 * @apiGroup Connections
 * 
 * @apiDescription Adds a connection to a user.
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiSuccess {String[]} Message stating Create is successful.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.put("/:reciever", (request, response) => {
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

    let values=  [request.decoded.email, request.params.reciever]
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
 * @api {delete} / Deletes a contact for a user
 * @apiName DeleteContacts
 * @apiGroup Connections
 * 
 * @apiDescription Deletes a specific contact for a user.
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiParam {String} sender of the email to look up. 
 * @apiParam {String} reciever of the email to look up. 
 * @apiSuccess {String[]} String of all valid emails.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.delete("/:reciever", (request, response) => {
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

    let values=  [request.decoded.email, request.params.reciever]
    console.log(values)
    pool.query(insert, values)
        .then(result => {
            if(result.rowCount > 0){
                response.send({
                 message: "DELETE SUCCESS!"            
                }) 
            }
            else {
                response.status(400).send({
                    message: "No such connection found"            
                   }) 
            }
            
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
});

module.exports = router