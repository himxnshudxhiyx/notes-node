// const mongoose = require("mongoose");



// const connectDB = (url) => {
//     console.log("Connect DB");
//     return mongoose.connect(url);
// }

// module.exports = connectDB;

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://mynotes-dss-default-rtdb.firebaseio.com'
});

const db = admin.firestore();
module.exports = db;