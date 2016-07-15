/**
 * Created by S on 2016. 07. 10..
 */
var AppResponse = function(status, message, data, meta) {
    return {
        status: status,
        message: message,
        data: data,
        meta: meta
    }
}

module.exports=AppResponse;