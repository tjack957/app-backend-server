//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())

/**
 * @api {put} / Approves and incoming request
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
router.put("/:reciever", (request, response, next) => {
    //perform the Select
    let insert = `  Select * from contacts WHERE memberid_a =
                    (Select
	                    Members.MemberID
                        From Members
                        Where Members.Email=$2) AND
                    memberid_b =
                    (SELECT
                        Members.MemberID
                        From Members
                        Where Members.Email=$1) AND
                    verified = 0;`

    let values=  [request.decoded.email, request.params.reciever]
    pool.query(insert, values)
        .then(result => {
            if(result.rowCount > 0){
               next() 
            }
            else {
                response.status(400).send({
                    message: "Contact not Found"
                })
            }
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
}, (request, response, next) => {
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

                    1);`

    let values=  [request.decoded.email, request.params.reciever]
    pool.query(insert, values)
        .then(result => {
            console.log("inserted the other way")
            next()
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
}, (request, response) => {
    let insert = `  UPDATE contacts SET verified =1 where memberid_a=
                    (Select
	                    Members.MemberID
                        From Members
                        Where Members.Email=$2)
                    AND memberid_b =
                    (SELECT
                        Members.MemberID
                        From Members
                        Where Members.Email=$1);`

    let values=  [request.decoded.email, request.params.reciever]
    pool.query(insert, values)
        .then(result => {
            if(result.rowCount > 0){
                console.log("updated")
                response.send({
                    message: "INSERT SUCCESS!"            
                })
            }
            else {
                console.log("not updated");
                response.status(400).send({
                    message: "UPDATE FAILED"
                })
            }
            
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })
        })
});


/**
 * @api {delete} / Rejects an incoming request
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
    let insert = `  delete 
                    from contacts
                    where   contacts.memberid_a =
                            (select Members.memberid
                            From Members
                            Where Members.email=$2)
                    AND
                            contacts.memberid_b = 
                            (select Members.memberid
                            From Members
                            Where Members.email=$1)
                    AND
                            verified = 0;`

    let values=  [request.decoded.email, request.params.reciever]
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

/**
 * @api {post} / Read all requests you have sent out
 * @apiName PostContacts
 * @apiGroup Contacts
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
                Where Members.email=$1) and verified = 0)`

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
 * @api {get} / Read all contacts you have pending
 * @apiName PostContacts
 * @apiGroup Contacts
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiDescription Reqquest to get all the valid emails in the DB.
 * 
 * @apiSuccess {String[]} String of all valid emails.
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */ 
router.get("/", (request, response) => {
    //perform the Select
    console.log("MADE IT")
    let query = `select Members.email
	            from Members
	            Where Members.memberid IN

                (Select contacts.memberid_a
	            from Contacts
	            Where contacts.memberid_b =

                (select Members.memberid
                From Members
                Where Members.email=$1) and verified = 0)`

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




module.exports = router