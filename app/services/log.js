
angular.module('crescendo-checkin')
.service('log', function(){

    function err(msg, target){
        console.error('ERROR - ' + target + ': ' + msg);
    }

    function info(msg, target){
        console.info('INFO - ' + target + ': ' + msg);
    }

    function warn(msg, target){
        console.warn('WARN - ' + target + ': ' + msg);
    }

    return {
        err: err,
        info: info,
        warn: warn
    }
});


