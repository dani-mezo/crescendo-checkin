/**
 * Created by S on 2016. 07. 03..
 */

var IdentityService = function(log, DatabaseService, RoleProvider, StatusProvider, AppResponse, ResponseProvider) {

    var target = 'IdentityService';

    function authorize(task, token, callback){
        //TODO
    }

    function authenticate(username, password, callback){

        func = 'Authenticate volunteer';

        log.info(func, target);

        DatabaseService.authenticateVolunteer(username, password, function(status){
            statusHandler(status, func, callback);
        });
    }


    function newVolunteer(firstname, lastname, rarepassword, username, callback){

        var func = 'New volunteer';

        log.info(func, target);

        DatabaseService.insertVolunteer(firstname, lastname, rarepassword, username, function(status){
            statusHandler(status, func, callback);
        });
    }

    function statusHandler(status, f, callback){

        if(!status.data){
            status.data = StatusProvider.NODATA;
        }

        var res = new AppResponse(status.status, status.message, status.data, status.meta);

        log.info(f + ' processed - ' + status.status, target);

        callback(res);
    }

    return {
        authenticate: authenticate,
        newVolunteer: newVolunteer
    }
}

module.exports=IdentityService;