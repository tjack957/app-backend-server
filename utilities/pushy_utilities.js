var Pushy = require('pushy');
// Plug in your Secret API Key 
var pushyAPI = new Pushy(process.env.PUSHY_API_KEY);

//use to send message to a specific client by the token
function sendMessageToIndividual(token, message) {

    //build the message for Pushy to send
    var data = {
        "type": "msg",
        "message": message,
        "chatid": message.chatid
    }

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}

//use to send message to a specific client by the token
function sendAccept(token, nameOfPerson) {

    //build the message for Pushy to send
    var data = {
        "type": "accept",
        "message": nameOfPerson
    }

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}

//use to send message to a specific client by the token
function sendDecline(token, nameOfDeclined) {

    //build the message for Pushy to send
    var data = {
        "type": "decline",
        "message": nameOfDeclined
    }

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}

//use to send message to a specific client by the token
function sendRemove(token, nameOfRemoved) {

    //build the message for Pushy to send
    var data = {
        "type": "remove",
        "message": nameOfRemoved
    }

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}

//use to send message to a specific client by the token
function sendRequestRecieved(token, personWhoRecieved) {

    //build the message for Pushy to send
    var data = {
        "type": "request",
        "message": personWhoRecieved
    }

    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}
//add other "sendYypeToIndividual" functions here. Don't forget to exprot them

module.exports = {
    sendMessageToIndividual, sendAccept, sendDecline, sendRemove, sendRequestRecieved
}