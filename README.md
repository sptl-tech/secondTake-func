# Second Take (back-end)

https://secondtake-40b4f.firebaseapp.com/

> This repository contains all the back-end code for the Second Take application. I used Firebase and Express.JS for the back-end code. Postman was also used for API testing.  

---

### Table of Contents

- [Description](#description)
- [How To Use](#how-to-use)
- [Acknowledgments](#acknowledgments)
- [License](#license)
- [Author Info](#author-info)

---

## Description
Video Guide of all Features - [Video](https://drive.google.com/file/d/1-uYZVd0fhgjsjVbMPWgTYTUMVylddx1l/view?usp=sharing)

This repository was primarily built with Firebase for thier realtime database and thier API to store information on the cloud and with the Express.JS framework which primarily helped handle multiple HTTP requests in the program. 
When starting the project, I had very minimal knowledge of server-side programming and had to learn client-server architechture and understand how back-end development worked. 
I wanted to do this to have a complete application where data can be stored and retreived easily. I have detailed my 
inspiration for creating this project in my client-side READ.ME file [here](https://github.com/sptl-tech/secondtake-cli#description). 

#### Technologies

- React
- Redux
- Firebase
- Express.JS (Node.JS application framework)
- Material-UI
- Postman (API testing)

[Back To The Top](#second-take)

---

## How To Use

#### Prerequistes 
- Download Node.JS Installer (https://nodejs.org/en/download/). The installer comes with the NPM package manager. 
- Configure Firebase with a Google account (https://firebase.google.com/)

#### Installation
Clone the GitHub Repository 

```sh
git clone https://github.com/sptl-tech/secondtake-cli.git
```

Run NPM to install all necessary packages/dependencies
```sh
npm install
```


#### API Reference
The panels below highlight some of the API calls

Takes (posts)
```sh
GET /takes -- retreive all posts
GET /take/:takeId -- retreieve a specific post 
GET /take/:takeId/like -- liking a take
GET /take/:takeId/unlike -- unliking a take
```
```sh
POST /take -- posting a take
POST /take/:takeId/comment -- adding comment to a post 
DELETE /take/:takeId -- delete a take
```

Users
```sh
GET /user -- retreive all user data 
GET /user/:handle -- retreieve details for specific user (depending on handle)
```
```sh
POST /signup -- signup a new user
POST /login -- authenticate an existing user 
POST /user/image -- uploading profile picture
POST /user -- Adding and editing user details
```

[Back To The Top](#second-take)

---

## Acknowledgments
- Express JS Crash Course by Traversy Media -- https://www.youtube.com/watch?v=L72fhGm1tfE
- How to Build REST API with Node JS & Express by Programming with Mosh -- https://www.youtube.com/watch?v=pKd0Rpw7O48
- Firebase Documentation -- https://firebase.google.com/docs
- Cloud Computing - Client/ Server Architecture Introduction by Eli The Computer Guy -- https://www.youtube.com/watch?v=Uu8KfoK1uPE
- Create REST API using Express with Firebase cloud functions by Savini Hemachandra -- https://medium.com/@savinihemachandra/creating-rest-api-using-express-on-cloud-functions-for-firebase-53f33f22979c
- Building an API with Firebase by Andrew Evans -- https://indepth.dev/building-an-api-with-firebase/

[Back To The Top](#second-take)

---

## License

MIT License

Copyright (c) [2020] [Sahil Patel]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[Back To The Top](#second-take)

---

## Author Info

- Website - [Sahil Patel](https://sptl-tech.github.io/)
- LinkedIn - [Sahil Patel](https://www.linkedin.com/in/sahilpatel-0/)

[Back To The Top](#second-take)

