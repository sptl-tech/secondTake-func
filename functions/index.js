const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
const FBAuth = require('./util/fbAuth');    

const {getAllTakes, postOneTake} = require('./handlers/takes')
const {signup, login, uploadImage} = require('./handlers/users');

const db = admin.firestore();

//takes routes 
app.get('/takes', getAllTakes);
app.post('/take', FBAuth, postOneTake);

//users routes
app.post('/signup', signup); //signup route
app.post('/login', login)//login route
app.post('/user/image', FBAuth, uploadImage) //route for users to upload thier image

exports.api = functions.https.onRequest(app); 