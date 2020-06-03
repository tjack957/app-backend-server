//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())

/**
 * @api {get} /get existing chatroom
 * @apiName GetChatRooms
 * @apiGroup ChatRoom
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiParam {Int} id of the chatroom
 * 
 * @apiSuccess (Success 201) {boolean} success true when the chatroom is deleted.
 * 
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * 
 * @apiUse JSONError
 */ 
router.get("/", (request, response) => {

    let insert = `select * from chats where
                    chatid in
                    (select chatid from chatmembers where memberid=$1) and not chatid in
                    (select chatid from chatactive)`
    console.log(request.query)
    let values = [request.decoded.memberid]
    pool.query(insert, values)
        .then(result => {
            console.log(result)
            response.send({
               rows:result.rows
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })

        })
})
/**
 * @api {delete} /delete existing chatroom
 * @apiName DeleteChatRooms
 * @apiGroup ChatRoom
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * @apiParam {Int} id of the chatroom
 * 
 * @apiSuccess (Success 201) {boolean} success true when the chatroom is deleted.
 * 
 *  
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * 
 * @apiUse JSONError
 */ 
router.delete("/:chatid?", (request, response) => {

    let insert = `  Insert into ChatActive(chatid, activeid) values ($1,0)`
    let values = [request.params.chatid]
    pool.query(insert, values)
        .then(result => {
            response.send({
                message: "Chat Room Deleted"
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })

        })
})

/**
 * @api {put} /Change the name of a chatroom
 * @apiName PutChatRoom
 * @apiGroup ChatRoom
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is changed
 *   
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * 
 * @apiUse JSONError
 */ 
router.put("/", (request, response) => {

    let insert = `  Update chats
                    set name=$1
                    where chatid=$2`
    console.log(request.body)
    let values = [request.body.name, request.body.chatid]
    pool.query(insert, values)
        .then(result => {
            response.send({
                message: "Chat Room Updated"
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })

        })
})

/**
 * @api {post} /Get the users in your friendlist that are not in the chatroom
 * @apiName PostChatRoom
 * @apiGroup ChatRoom
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess (Success 201) {boolean} success true when the list is returned
 *   
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * 
 * @apiUse JSONError
 */ 
router.post("/:chatid", (request, response) => {

    let insert = ` select memberid_b from contacts where memberid_a=$1 and memberid_b not in (select memberid from chatmembers where chatid=$2) and verified = 1;`
    console.log(request.body)
    let values = [request.decoded.memberid, request.params.chatid]
    pool.query(insert, values)
        .then(result => {
            response.send({
                rows: result.rows
            })
        }).catch(err => {
            response.status(400).send({
                message: "SQL Error",
                error: err
            })

        })
})

module.exports = router