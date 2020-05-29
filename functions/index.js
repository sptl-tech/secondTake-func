const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config = {
    apiKey: "AIzaSyAktPL4lKQXYsgBxADrw8wMUyF9JMkb9uU",
    authDomain: "secondtake-40b4f.firebaseapp.com",
    databaseURL: "https://secondtake-40b4f.firebaseio.com",
    projectId: "secondtake-40b4f",
    storageBucket: "secondtake-40b4f.appspot.com",
    messagingSenderId: "951325083105",
  };


const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/takes', (req, res) => {
    db
    .collection('takes')
    .orderBy('createdAt', 'desc') //allows us to have takes ordered by last posted (desending order)
    .get()
    .then((data) => {
            let takes = [];
            data.forEach((doc) => { //adds data to the empty string of takes depending on inputted data
                takes.push({
                    takeID: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                })
            });
            return res.json(takes); //returns a json file of the takes data
        })
        .catch(err => console.error(err)); //error handling 
})

const FBAuth = (req, res, next) =>{ //middleware; allows us to check for authentication before proceeding in other methods
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){ //checks if token exists
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else{
        console.error('No Token Found');
        return res.status(403).json({error: 'Unauthorized'})
    }
    admin.auth().verifyIdToken(idToken) //verifies token 
        .then(decodedToken =>{
            req.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users')
                .where('userID', '==', req.user.uid )
                .limit(1)
                .get();
        })
        .then(data =>{
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch(err =>{
            console.error('Error while verifying token', err);
            return res.status(403).json(err);
        })
}
//posting a new take 
app.post('/take', FBAuth, (req, res) => {
    if (req.body.body.trim() === ''){
        return res.status(400).json({body: 'Body must not be empty'});
    }
    if(req.method !== 'POST'){ //exception handling
        return res.status(400).json({error: "Method not Allowed"})
    };
    const newTake = { //creates a new take by requesting the following data
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString() //format creation of take by data string
    };

    db
        .collection('takes')
        .add(newTake) //either recieve a sucess message or failure message if take was added
        .then((doc) => {
            res.json({message: `document ${doc.id} created successfully`})
        }) 
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err); //error handling 
        })

});

//helper method to check if input string is empty
const isEmpty =(string) =>{ 
    if (string.trim() === '') return true;
    else return false;
}
const isEmail = (email) =>{ //validate if email is valid
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else{
        return false;
    }
}
//Signup route 
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,

    };
    let errors ={};
    if (isEmpty(newUser.email)) { //checks if email is empty using helper method and prints error message
        errors.email = 'Must not be empty'
    }
    else if(!isEmail(newUser.email)){
        errors.email='Email is not valid. Must be a valid email address'
    }

    if (isEmpty(newUser.password)) errors.password = 'Must not be empty' //checks if the password is empty 

    if(newUser.password!== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match'; //checks if confirmed password is same as password

    if (isEmpty(newUser.handle)) errors.handle ='Must not be empty' //cannot have empty user handle

    if (Object.keys(errors).length > 0){
        return res.status(400).json(errors);
    }
    //TODO validate data 
    let token, userId
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists){
                return res.status(400).json({ handle: 'This handle has already been taken'});
            }
            else{
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data =>{
            userId = data.user.uid;
            return data.user.getIdToken();

        })
        .then(idtoken =>{
            token = idtoken;
            const userCredentials ={ //creates a new user document
                handle: newUser.handle,
                email: newUser.email, 
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials)

        })
        .then(()=>{
            return res.status(201).json({token});
        })
        .catch((err) =>{ 
            console.error(err); 
            if (err.code === 'auth/email-already-in-use'){ //logs error if email is already in database 
                return res.status(400).json({email: 'Email is already in use'})
            }
            else{
                return res.status(500).json({error: err.code})
            }
        });
});

//Login route

app.post('/login', (req, res) =>{
    const user ={ //takes in email and password from user
        email: req.body.email,
        password: req.body.password
    };

    let errors ={};

    if (isEmpty(user.email)) errors.email = 'Must not be empty'; //checks for empty email
    if (isEmpty(user.password)) errors.password = 'Must not be empty'; //checks for empty password

    if(Object.keys(errors).length >0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password) //if no errors, sing up user
        .then((data)=> {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({ token });
        })
        .catch((err) =>{
            console.error(err);
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({general: 'Wrong credentials, please try again'});
            }
            if (err.code === 'auth/invalid-email'){
                return res.status(403).json({general: "Invalid email, please try again"});
            }
            else return res.status(500).json({error : err.code});
        })
})

exports.api = functions.https.onRequest(app); 