//How our data will look like; serves as a reference. File is not used
let db = {

    users: [
        {
            userId: 'yaaaaman',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2020-05-26T21:50:58.858Z',
            imageUrl: 'image/jsdnaonoffaoi/nfwoiefnw',
            bio: 'Hello my name is user',
            website: 'https://user.com',
            location: 'San Jose, CA'

        }
    ],
    takes: [
        {
            userHandle: 'user',
            body: 'take body',
            createdAt: '2011-10-05T14:48:00.000Z',
            likeCount: 6, //how many likes a take has
            commentCount: 2 //how many comment a take has
        }
    ],
    comments: [
      {
        userHandle: 'user',
        takeId: 'kdjsfgdksuufhgkdsufky',
        body: 'nice one mate!',
        createdAt: '2019-03-15T10:59:52.798Z'
      }
    ],
    notifications: [
      {
        recipient: 'user',
        sender: 'john',
        read: 'true | false',
        screamId: 'kdjsfgdksuufhgkdsufky',
        type: 'like | comment',
        createdAt: '2019-03-15T10:59:52.798Z'
      }
    ]
};
const userDetails = {
    // Redux data
    credentials: {
      userId: 'N43KJ5H43KJHREW4J5H3JWMERHB',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2019-03-15T10:59:52.798Z',
      imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Lonodn, UK'
    },
    likes: [
      {
        userHandle: 'user',
        takeId: 'hh7O5oWfWucVzGbHH2pa'
      },
      {
        userHandle: 'user',
        takeId: '3IOnFoQexRcofs5OhBXO'
      }
    ]
  };