
angular.module('crescendo-checkin')
    .service('statusProvider', function() {
        return statusProvider();
});


function statusProvider(){

    return {
        OK: "ok",
        FAILED: "failed",
        WRONG: 'Wrong status code',
        INFO: "info",
        NODATA: "nodata"
    }
}