const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');    

const {getAllTakes, postOneTake} = require('./handlers/takes')
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser} = require('./handlers/users');


//takes routes 
app.get('/takes', getAllTakes);
app.post('/take', FBAuth, postOneTake);

//users routes
app.post('/signup', signup); //signup route
app.post('/login', login)//login route
app.post('/user/image', FBAuth, uploadImage) //route for users to upload thier image
app.post('/user', FBAuth, addUserDetails); // adding user details route
app.get('/user', FBAuth, getAuthenticatedUser);//retreving user data
exports.api = functions.https.onRequest(app); 