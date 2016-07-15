/**
 * Created by S on 2016. 07. 10..
 */
var Volunteer = function(firstname, lastname, hashedpassword, username) {
    return {
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: hashedpassword,
        token: ''
    }
}

module.exports=Volunteer;