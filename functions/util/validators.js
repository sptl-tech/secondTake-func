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

exports.validateSignUpData = (data) =>{
    let errors ={};
    if (isEmpty(data.email)) { //checks if email is empty using helper method and prints error message
        errors.email = 'Must not be empty'
    }
    else if(!isEmail(data.email)){
        errors.email='Email is not valid. Must be a valid email address'
    }

    if (isEmpty(data.password)) errors.password = 'Must not be empty' //checks if the password is empty 

    if(data.password!== data.confirmPassword) errors.confirmPassword = 'Passwords must match'; //checks if confirmed password is same as password

    if (isEmpty(data.handle)) errors.handle ='Must not be empty' //cannot have empty user handle


    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) =>{
    let errors ={};

    if (isEmpty(data.email)) errors.email = 'Must not be empty'; //checks for empty email
    if (isEmpty(data.password)) errors.password = 'Must not be empty'; //checks for empty password

    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}