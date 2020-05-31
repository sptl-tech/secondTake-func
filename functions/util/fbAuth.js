const {admin, db} = require ('./admin');

module.exports = (req, res, next) =>{ //middleware; allows us to check for authentication before proceeding in other methods
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){ //checks if token exists
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else{
        console.error('No Token Found');
        return res.status(403).json({error: 'Unauthorized'})
    }
    admin.auth().verifyIdToken(idToken) //verifies token 
        .then((decodedToken) =>{
            req.user = decodedToken;
            return db.collection('users')
                .where('userId', '==', req.user.uid )
                .limit(1)
                .get();
        })
        .then((data) =>{
            req.user.handle = data.docs[0].data().handle;
            req.user.imageUrl = data.docs[0].data().imageUrl;
            return next();
        })
        .catch((err) =>{
            console.error('Error while verifying token', err);
            return res.status(403).json(err);
        });
};