const { db } = require('../util/admin');

exports.getAllTakes = (req, res) => { //retreving takes
    db
    .collection('takes')
    .orderBy('createdAt', 'desc') //allows us to have takes ordered by last posted (desending order)
    .get()
    .then((data) => {
            let takes = [];
            data.forEach((doc) => { //adds data to the empty string of takes depending on inputted data
                takes.push({
                    takeId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                    userImage: doc.data().userImage
                })
            });
            return res.json(takes); //returns a json file of the takes data
        })
        .catch(err => console.error(err)); //error handling 
    }; 


exports.postOneTake = (req, res) => { //posting a new take
    if (req.body.body.trim() === ''){
        return res.status(400).json({body: 'Body must not be empty'});
    }
    if(req.method !== 'POST'){ //exception handling
        return res.status(400).json({error: "Method not Allowed"})
    };
    const newTake = { //creates a new take by requesting the following data
        body: req.body.body,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(), //format creation of take by data string
        likeCount: 0, //initialize like, comment count to 0
        commentCount: 0
    };

    db
        .collection('takes')
        .add(newTake) //either recieve a sucess message or failure message if take was added
        .then((doc) => {
            const resTake = newTake; 
            resTake.takeId = doc.id;
            res.json(resTake)
        }) 
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err); //error handling 
        })

}
//get one take 
exports.getTake = (req, res) =>{
    let takeData = {};
    db.doc(`/takes/${req.params.takeId}`).get()
        .then(doc =>{
            if(!doc.exists){
                return res.status(404).json({error: 'Take not found'})
            }
            takeData = doc.data(); //adds document data to the empty obj
            takeData.takeId = doc.id;
            return db.collection('comments').orderBy('createdAt', 'desc').where('takeId', '==', req.params.takeId).get();
                
        })
        .then(data =>{
            takeData.comments = [];
            data.forEach(doc =>{ //pushes comment data onto the array 
                takeData.comments.push(doc.data())
            })
            return res.json(takeData);
        })
        .catch (err =>{
            console.error(err);
            res.status(500).json({error: err.code});
        })
}
//Comment on a take
exports.commentOnTake = (req, res) =>{
    if(req.body.body.trim() === '') return res.status(400).json({comment: 'Cannot Be Empty'});

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        takeId: req.params.takeId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    db.doc(`/takes/${req.params.takeId}`).get()
        .then(doc =>{
            if(!doc.exists){ //in case take gets deleted/not avaliable
                return res.status(404).json({error: 'Take not found'})
            }
            return doc.ref.update({commentCount: doc.data().commentCount +1})
        })
        .then(() =>{
            return db.collection('comments').add(newComment);
        })
        .then(() =>{
            res.json(newComment);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({error: 'Something Went Wrong'});
        })
}

//like a take
exports.likeTake = (req, res) =>{
    const likeDoc = db.collection('likes').where('userHandle', '==', req.user.handle)
        .where('takeId', '==', req.params.takeId).limit(1);

    const takeDoc = db.doc(`takes/${req.params.takeId}`);

    let takeData;

    takeDoc.get()
        .then(doc =>{
            if (doc.exists){ //doc exists 
                takeData = doc.data();
                takeData.takeId = doc.id;
                return likeDoc.get();
            }
            else{
                return res.status(404).json({error: 'Take not found'});
            }
        })
        .then(data =>{ //if user has not liked they can; if they have liked already they can't like again
            if(data.empty){ //allows user to like the take
                return db.collection('likes').add({
                    takeId: req.params.takeId,
                    userHandle: req.user.handle
                })
                .then(() =>{
                    takeData.likeCount++;
                    return takeDoc.update({ likeCount: takeData.likeCount})
                })
                .then(() => {
                    return res.json(takeData); //returns take w/ new like count
                })
            }
            else{ //have a like in data array and user cannot like it
                return res.status(400).json({error: 'Take already liked'});
            }
        })
        .catch(err =>{
            console.error(err);
            res.status(500).json({error: err.code});
        })
}

exports.unlikeTake = (req, res) => {
    const likeDoc = db.collection('likes').where('userHandle', '==', req.user.handle)
        .where('takeId', '==', req.params.takeId).limit(1);

    const takeDoc = db.doc(`takes/${req.params.takeId}`);

    let takeData;

    takeDoc.get()
        .then(doc =>{
            if (doc.exists){ //doc exists 
                takeData = doc.data();
                takeData.takeId = doc.id;
                return likeDoc.get();
            }
            else{
                return res.status(404).json({error: 'Take not found'});
            }
        })
        .then(data =>{ //if user has not liked they cannot unlike; if they have liked already they can unlike
            if(data.empty){  
                return res.status(400).json({error: 'Take not liked'}); //if user tries to unlike a take they never liked
                
            }
            else{ 
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                    .then(() =>{ //decrements like count and returns updated take data
                        takeData.likeCount--;
                        return takeDoc.update({likeCount: takeData.likeCount});
                    })
                    .then(() =>{
                        res.json(takeData)
                    })
            }
        })
        .catch(err =>{
            console.error(err);
            res.status(500).json({error: err.code});
        })
};

//Deleting take
exports.deleteTake = (req, res) =>{
    const document = db.doc(`takes/${req.params.takeId}`);
    document.get()
        .then(doc =>{
            if(!doc.exists){ //trying to delete a take that hasnt been posted
                return res.status(404).json({error: 'Take Not Found'});
            }
            if(doc.data().userHandle !== req.user.handle){ //prevents other users from deleting others' takes
                return res.status(403).json({error: 'Unauthorized'});
            }
            else{
                return document.delete();
            }
        })
        .then(() =>{
            res.json({message: 'Take deleted successfully'});
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error: err.code});
        })
}