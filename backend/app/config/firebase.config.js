var admin = require("firebase-admin");

var serviceAccount = require("./peyon-18dc6-firebase-adminsdk-apb1j-8e8294c899.json");


let firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://peyon-18dc6-default-rtdb.firebaseio.com/"
})

module.exports.admin = firebaseApp