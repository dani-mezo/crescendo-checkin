/**
 * Created by S on 2016. 07. 10..
 */
/**
 * Created by S on 2016. 07. 03..
 */

var DataService = function(log, DatabaseService, RoleProvider, StatusProvider, AppResponse , PrimarilyProvider, SecondaryProvider, CheckinService) {

    var target = 'DataService';

    function getVolunteers(callback){
        var func = 'Get volunteers';

        log.info(func, target);

        DatabaseService.getVolunteers(function(status){
            statusHandler(status, func, callback);
        });
    }

    function getUsers(callback){
        var func = 'Get users';

        log.info(func, target);

        DatabaseService.getUsers(function(status){
            statusHandler(status, func, callback);
        });
    }

    function saveUsers(callback){
        var func = 'Save users';

        log.info(func, target);

        DatabaseService.saveUsers(function(status){
            statusHandler(status, func, callback);
        });
    }

    function saveUser(user, callback){
        var func = 'Save a user';

        log.info(func, target);

        DatabaseService.saveUser(user, function(status){
            statusHandler(status, func, callback);
        });
    }

    function getSecondaryAttributes(callback){
        callback(new AppResponse(StatusProvider.OK, "Secondary attributes requested successfully", SecondaryProvider, {}));
    }

    function getPrimarilyAttributes(callback){
        callback(new AppResponse(StatusProvider.OK, "Primarily attributes requested successfully", PrimarilyProvider, {}));
    }

    function getCheckinConfiguration(callback){
        callback(new AppResponse(StatusProvider.OK, "Checkin configuration requested successfully", CheckinService.getCheckinConfiguration(), {}));
    }

    function saveCheckinConfiguration(checkin, callback){
        if(CheckinService.validateCheckinConfiguration(checkin)){
            CheckinService.saveCheckinConfiguration(checkin);
            callback(new AppResponse(StatusProvider.OK, "Checkin configuration saved successfully", {}, {}));
        } else {
            callback(new AppResponse(StatusProvider.FAILED, "Checkin configuration saving failed", {}, {}));
        }
    }

    function issueResolved(id){
        DatabaseService.resolveIssue(id);
    }

    function statusHandler(status, f, callback){

        var res = new AppResponse(status.status, status.message, status.data);

        log.info(f + ' processed - ' + status.status, target);

        callback(res);
    }

    return {
        getVolunteers: getVolunteers,
        getPrimarilyAttributes: getPrimarilyAttributes,
        getSecondaryAttributes: getSecondaryAttributes,
        getCheckinConfiguration: getCheckinConfiguration,
        saveCheckinConfiguration: saveCheckinConfiguration,
        getUsers: getUsers,
        saveUser: saveUser,
        saveUsers: saveUsers,
        issueResolved: issueResolved
    }
}

module.exports=DataService;