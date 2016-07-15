/**
 * Created by S on 2016. 07. 03..
 */
var _ = require('lodash');

var CheckinService = function(log, RoleProvider, SecondaryProvider) {

    var DatabaseService;
    var target = 'CheckinService';

    /*
    checkin = {
        primarily: [username1, username2, ..],
        secondary: [
            {
                username: username1,
                attributes: [attr1, attr2, attr3 ...]
            },
            {
                username: username2,
                attributes: [attr4, attr6, attr5 ...]
            },
            ...
        ]
    }
     */
    var checkin = {};
    checkin.primarily = [];
    checkin.secondary = [];

    function getRole(username){

        isPrimarily = _.find(checkin.primarily, function(volunteer) { return volunteer == username });
        isSecondary = _.find(checkin.secondary, function(volunteer) { return volunteer.username == username });

        if(isPrimarily){
            return RoleProvider.PRIMARILY;
        }

        if(isSecondary){
            return RoleProvider.SECONDARY;
        }

        return RoleProvider.UNKNOWN;
    }

    function saveCheckinConfiguration(check){
        checkin = check;
    }

    function getCheckinConfiguration(){
        return checkin;
    }

    function setDatabaseService(service){
        DatabaseService = service;
    }

    function validateCheckinConfiguration(check){

        //TODO
        return true;

        if(!check || !check.primarily || !check.secondary) return false;
        if(check.primarily.length === 0) return false;

        var attrs = [];
        _.forEach(check.secondary, function(item){
            _.forEach(item.attributes, function(attr){
                attrs.push(attr);
            });
        });

        var isNotAllAttributes = _.some(SecondaryProvider, function(value, key){
            return (0 > attrs.indexOf(value));
        })

        if(isNotAllAttributes) return false;

        return true;
    }

    return {
        getRole: getRole,
        saveCheckinConfiguration: saveCheckinConfiguration,
        getCheckinConfiguration: getCheckinConfiguration,
        setDatabaseService: setDatabaseService,
        validateCheckinConfiguration: validateCheckinConfiguration
    }
}

module.exports=CheckinService;