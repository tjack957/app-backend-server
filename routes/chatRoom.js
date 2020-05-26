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

    let insert = `select chats.name from chats`
    console.log(request.query)
    let values = null
    //let values = [request.query]
    pool.query(insert, values)
        .then(result => {
            console.log(result)
            response.send({
               rowCount: result.rowCount,
               rows: result.rows
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

    let insert = `  Delete from chats
                    where chats.chatid=$1`
    console.log(request.query)
    let values = [request.query.chatid]
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

module.exports = router