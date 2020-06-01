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
                    createdAt: doc.data().createdAt
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
    if(req.body.body.trim() === '') return res.status(400).json({error: 'Cannot Be Empty'});

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