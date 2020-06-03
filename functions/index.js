const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');    

const {db} = require('./util/admin')
const {getAllTakes, postOneTake, getTake, commentOnTake, likeTake, unlikeTake, deleteTake} = require('./handlers/takes')
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead} = require('./handlers/users');


//takes routes 
app.get('/takes', getAllTakes); //retreving all takes
app.post('/take', FBAuth, postOneTake); //posting a take
app.get('/take/:takeId', getTake);
app.post('/take/:takeId/comment', FBAuth, commentOnTake); //route to add comments 
app.get('/take/:takeId/like', FBAuth, likeTake); //getting liked takes
app.get('/take/:takeId/unlike', FBAuth, unlikeTake); //getting unliked takes
app.delete('/take/:takeId', FBAuth, deleteTake); //route to delete scream
//users routes
app.post('/signup', signup); //signup route
app.post('/login', login)//login route
app.post('/user/image', FBAuth, uploadImage) //route for users to upload thier image
app.post('/user', FBAuth, addUserDetails); // adding user details route
app.get('/user', FBAuth, getAuthenticatedUser);//retreving user data
app.get('/user/:handle', getUserDetails) //pass the handle and get details on the user
app.post('/notifications', FBAuth,markNotificationsRead);

exports.api = functions.https.onRequest(app); 

//creating notifications

//notification for likes
exports.createNotificationOnLike = functions.firestore.document('/likes/{id}') //using firebase documentation to function on create triggers whenever a post is liked
    .onCreate((snapshot) => {
        return db.doc(`/takes/${snapshot.data().takeId}`).get() //uses snapshot from firebase to extract data from take using takeId
            .then(doc =>{
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){ //ensures users dont get notification if they like thier own post
                    return db.doc(`/notifications/${snapshot.id}`).set({ //creates a notifcation
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle, //who will recieve the notification (who posted the take and got engagement)
                        sender: snapshot.data().userHandle, //person who liked/commented
                        type: 'like', //for like notification
                        read: false,
                        takeId: doc.id
                    })
                }
            })
            .catch(err => {
                console.error(err);
            })
    })

//case for when someone unlikes a post => notification needs to be deleted
exports.deleteNotificationOnUnlike = functions.firestore.document('/likes/{id}')
    .onDelete((snapshot) =>{
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => {
                console.error(err);
                return;
            })
    })

//comment notifications
exports.createNotificationOnComment = functions.firestore.document('/comments/{id}')
    .onCreate((snapshot) =>{
        return db.doc(`/takes/${snapshot.data().takeId}`).get() //uses snapshot from firebase to extract data from take using takeId
            .then(doc =>{
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){ //no notification if user comments on thier own post
                    return db.doc(`/notifications/${snapshot.id}`).set({ //creates a notifcation using comment document id
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle, //who will recieve the notification (who posted the take and got engagement)
                        sender: snapshot.data().userHandle, //person who liked/commented
                        type: 'comment', //for comment notification
                        read: false,
                        takeId: doc.id
                    })
                }
            })
            .catch(err => {
                console.error(err);
                return;
            })
    })
