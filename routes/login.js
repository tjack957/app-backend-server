//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

let getHash = require('../utilities/utils').getHash

var router = express.Router()

const bodyParser = require("body-parser")
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json())

//Pull in the JWT module along with out asecret key
let jwt = require('jsonwebtoken')
let config = {
    secret: process.env.JSON_WEB_TOKEN
}

/**
 * @api {get} /login Request to sign a user in the system
 * @apiName GetAuth
 * @apiGroup Auth
 * 
 * @apiHeader {String} authorization "username:password" uses Basic Auth 
 * 
 * @apiSuccess {boolean} success true when the name is found and password matches
 * @apiSuccess {String} message Authentication successful!
 * @apiSuccess {String} token JSON Web Token
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (404: User Not Found) {String} message "User not found"
 * 
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 */ 
router.get('/', (request, response) => {
    if (!request.headers.authorization || request.headers.authorization.indexOf('Basic ') === -1) {
        return response.status(401).json({ message: 'Missing Authorization Header' })
    }
    // obtain auth credentials from HTTP Header
    const base64Credentials =  request.headers.authorization.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [email, theirPw] = credentials.split(':')

    if(email && theirPw) {
        let theQuery = "SELECT Password, Salt, Verification, MemberId FROM Members WHERE Email=$1"
        let values = [email]
        pool.query(theQuery, values)
            .then(result => { 
                console.log("result 1")
                console.log(result)
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: 'User not found' 
                    })
                    return
                }
                console.log("result 2")
                let salt = result.rows[0].salt
                //Retrieve our copy of the password

                let ourSaltedHash = result.rows[0].password 
                //CHECK VERIFICATION NEW CODE
                console.log(ourSaltedHash)
                let verification = result.rows[0].verification
                //Combined their password with our salt, then hash
                console.log(verification)
                let theirSaltedHash = getHash(theirPw, salt)
                //&& VERIFICATION === 1 IS NEW CODE
                //Did our salted hash match their salted hash?
                if(ourSaltedHash === theirSaltedHash){
                    console.log("salt match")
                }

                if(verification === 1){
                    console.log("verified user")
                }
                if (ourSaltedHash === theirSaltedHash && verification === 1) {
                    console.log("result 3")
                    //credentials match. get a new JWT
                    let token = jwt.sign(
                        {
                            "email": email,
                           memberid: result.rows[0].memberid
                        },
                        config.secret,
                        { 
                            expiresIn: '14 days' // expires in 14 days
                        }
                    )
                    console.log("result 4")
                    //package and send the results
                    response.json({
                        success: true,
                        message: 'Authentication successful!',
                        token: token
                    })
                }
                if (ourSaltedHash === theirSaltedHash && verification === 0) {
                    console.log("not verified")
                    //credentials dod not match
                    response.status(400).send({
                        message: 'Not verified' 
                    })   
                } else {
                    console.log("result no match")
                    //credentials dod not match
                    response.status(400).send({
                        message: 'Credentials did not match' 
                    })
                }
            })
            .catch((err) => {
                //log the error
                //console.log(err.stack)
                console.log("Error catch")
                console.log(err)
                response.status(400).send({
                    message: err.detail
                })
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})

module.exports = router
