/**
 * Created by S on 2016. 07. 07..
 */
var DatabaseErrorProvider = function() {
    return {
        SUCCESS_SIGN_UP: "Successfully signed up!",
        FAILED_SIGN_UP: "Failed to sign up!",
        USER_EXISTS: "Username is already taken!",
        SUCCESS_LOGIN: "Successfully logged in!",
        WRONG_PASS: "Wrong password!",
        WRONG_USERNAME: "No user found with the given username!"
    }
}

module.exports=DatabaseErrorProvider;