
angular.module('crescendo-checkin')
    .service('roleProvider', function (){

    return {
        ADMIN: "admin",
        UNKNOWN: "error",
        ZSUZSI: "zsuzsi",
        PRIMARILY: "primarily",
        SECONDARY: "secondary"
    }
});