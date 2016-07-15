
angular.module('crescendo-checkin')
    .service('constProvider', function() {
        return constProvider();
});


function constProvider(){

    return {
        TOKEN: "token",
        ROLE: "role",
        NAME: "name",
        FIRSTNAME: "firstname",
        LASTNAME: "lastname",
        USERNAME: "username"
    }
}