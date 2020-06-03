const {admin, db} = require('../util/admin');

const config = require('../util/config');
const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignUpData, validateLoginData, reduceUserDetails} = require('../util/validators');
//signing up user
exports.signup = (req, res) => { //signup route
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,

    };

    const {valid, errors} = validateSignUpData(newUser);

    if(!valid) return res.status(400).json(errors);
    
    const defImg = 'defPP.jpeg'

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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defImg}?alt=media`,
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
}

//loggin in user 
exports.login =(req, res) =>{
    const user ={ //takes in email and password from user
        email: req.body.email,
        password: req.body.password
    };

    const {valid, errors} = validateLoginData(user);

    if(!valid) return res.status(400).json(errors);


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
}

//Adding user details 
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Details added successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        })
}
//get any user's details 
exports.getUserDetails =(req, res ) =>{
    let userData ={};
    db.doc(`/users/${req.params.handle}`).get() //takes in user handle 
        .then(doc =>{
            if (doc.exists){ //if user handle exists, return that user's takes in descending order
                userData.user = doc.data();
                return db.collection('takes').where('userHandle', '==', req.params.handle) 
                    .orderBy('createdAt', 'desc')
                    .get();
            }
            else{
                return res.status(404).json({error: 'User Not Found'});
            }
        })
        .then(data =>{
            userData.takes = [];
            data.forEach(doc =>{ //user data of takes will be all the takes that the user has made
                userData.takes.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    userHandle: doc.data().userHandle,
                    userImage: doc.data().userImage,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount,
                    takeId: doc.id
                    
                })
            })
            return res.json(userData)
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error: err.code})
        })
}

//get own user details 
exports.getAuthenticatedUser = (req, res) =>{
    let userData ={}; //response data
    db.doc(`/users/${req.user.handle}`).get()
        .then(doc => {
            if (doc.exists){
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', req.user.handle).get();
            }
        })
        .then(data =>{
            userData.likes =[];
            data.forEach(doc => {
                    userData.likes.push(doc.data());
                });
                //used for sending info to our front end
                return db.collection('notifications').where('recipient', '==', req.user.handle)
                    .orderBy('createdAt', 'desc').limit(10).get();
            })
            .then(data =>{
                userData.notifications =[];
                data.forEach(doc =>{ //goes through the data and adds notifications fields to the empty array
                    userData.notifications.push({
                        recipient: doc.data().recipient,
                        sender: doc.data().sender,
                        createdAt: doc.data().createdAt,
                        takeId: doc.data().takeId,
                        type: doc.data().type,
                        read: doc.data().read,
                        notificationId: doc.id
                    })
                })
                return res.json(userData);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({error: err.code});
            })
        
}


//uploading a profile image for user
exports.uploadImage = (req,res) => {
    const BusBoy = require("busboy");
    const path = require("path");
    const os = require("os");
    const fs = require("fs");

    const busboy = new BusBoy({ headers: req.headers });

    let imageUploaded ={};
    let imageFileName;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png'){ //handles cases when user does not upload an image file
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }

        const imageExtension = filename.split(".")[filename.split(".").length -1]; //want to only have image extention from file name (confusion can occue when name is my.images.png for example)
        imageFileName = `${Math.round(Math.random()*100000000000)}.${imageExtension}`;

        const filepath = path.join(os.tmpdir(), imageFileName);

        imageUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on("finish", () => {
        admin
            .storage()
            .bucket(`${config.storageBucket}`)
            .upload(imageUploaded.filepath, {
                resumable: false, 
                metadata: {
                    metadata: {
                        contentType: imageUploaded.mimetype
                    },
                },   
        })
        .then(() =>{ //image url
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            //add imageurl to user's doc in database
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
        })
        .then(() =>{
            return res.json({message: 'Image uploaded successfully'});
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error: err.code});
        })
    })
    busboy.end(req.rawBody);
};

//when we have notifications that are not read, send the ids of those notifications that user has seen so we can mark it as read
exports.markNotificationsRead = (req, res) =>{
    let batch = db.batch();
    req.body.forEach(notificationId =>{
        const notification = db.doc(`/notifications/${notificationId}`)
        batch.update(notification, {read: true}) //update notification as true => user has read the notification
    });
    batch.commit()
        .then(() =>{
            return res.json({message: 'Notifications marked read'})
        })  
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error: err.code})
        })
}
