/**
 * Created by S on 2016. 07. 07..
 */
var StatusProvider = function() {
    return {
        OK: "ok",
        FAILED: "failed",
        WRONG: 'Wrong status code',
        INFO: "info",
        NODATA: "nodata"
    }
}

module.exports=StatusProvider;