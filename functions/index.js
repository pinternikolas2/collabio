const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.ping = functions.https.onCall((data, context) => {
    return { message: "pong" };
});
