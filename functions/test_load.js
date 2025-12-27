try {
    console.log("Loading firebase-functions...");
    const functions = require("firebase-functions");
    console.log("Loaded firebase-functions");

    console.log("Loading firebase-admin...");
    const admin = require("firebase-admin");
    console.log("Loaded firebase-admin");

    console.log("Initializing app...");
    admin.initializeApp();
    console.log("Initialized app");

    console.log("Success");
} catch (e) {
    console.error("Error:", e);
}
