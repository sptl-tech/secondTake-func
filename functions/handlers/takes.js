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
                    takeID: doc.id,
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