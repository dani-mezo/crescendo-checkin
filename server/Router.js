/**
 * Created by S on 2016. 07. 03..
 */

var Router = function(log, router, IdentityService, DataService, StatusProvider, RouterMessageProvider){

    var target = "Router";
    var MISSION = '------------------ MISSION ------------------';

    // -- Hooks

    router.use(function(req, res, next) {
        log.info('', MISSION);
        log.info(req.method + " - " + req.path, target);
        next();
    });

    // -- Routes

    //*************************************************** Volunteer management

    router.post('/login', function (req, res) {

        log.info('Login attempt', target);

        var rarepassword = req.body.password;
        var username = req.body.username;

        if(!validateLogin(rarepassword, username)){
            sendError(res, RouterMessageProvider.INVALID_PARAMETERS);
            return;
        }

        function loginHandler(AppResponse){
            send(AppResponse, res);
        }

        IdentityService.authenticate(username, rarepassword, loginHandler);

    });


    router.post('/volunteers', function (req, res) {

        log.info('Add new volunteer', target);

        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var rarepassword = req.body.password;
        var username = req.body.username;

        if(!validateSignUp(firstname, lastname, rarepassword, username)){
            sendError(res, RouterMessageProvider.INVALID_PARAMETERS);
            return;
        }

        function newVolunteerResponseHandler(AppResponse){
            send(AppResponse, res);
        }

        IdentityService.newVolunteer(firstname, lastname, rarepassword, username, newVolunteerResponseHandler);

    });

    function validateSignUp(firstname, lastname, rarepassword, username){

        if( firstname === undefined || firstname === "" ||
            lastname === undefined || lastname === "" ||
            rarepassword === undefined || rarepassword === "" ||
            username === undefined || username === "" ){

            return false;
        }

        return true;
    }

    function validateLogin(rarepassword, username){

        if(
            rarepassword === undefined || rarepassword === "" ||
            username === undefined || username === "" ){

            return false;
        }

        return true;
    }

    router.get('/volunteers', function(req, res){

        log.info('Get volunteers', target);

        function getVolunteersResponseHandler(AppResponse){
            send(AppResponse, res);
        }

        DataService.getVolunteers(getVolunteersResponseHandler);
    });

    router.get('/primarily', function(req, res){

        log.info('Get primarily attributes', target);

        function handlePrimarilyAttributes(AppResponse){
            send(AppResponse, res);
        }

        DataService.getPrimarilyAttributes(handlePrimarilyAttributes);
    });

    router.get('/secondary', function(req, res){

        log.info('Get secondary attributes', target);

        function handleSecondaryAttributes(AppResponse){
            send(AppResponse, res);
        }

        DataService.getSecondaryAttributes(handleSecondaryAttributes);
    });

    router.get('/checkin/config', function(req, res){

        log.info('Get checkin configuration', target);

        function handleCheckinConfig(AppResponse){
            send(AppResponse, res);
        }

        DataService.getCheckinConfiguration(handleCheckinConfig);
    });

    router.post('/checkin/config', function (req, res) {

        log.info('Save checkin configuration', target);

        var checkin = req.body.checkin;

        function handleSavedConfig(AppResponse){
            send(AppResponse, res);
        }

        DataService.saveCheckinConfiguration(checkin, handleSavedConfig);

    });

    // -- Errors

    function send(AppResponse, res){
        switch(AppResponse.status){
            case StatusProvider.FAILED:
                sendError(res, AppResponse.message);
                break;
            case StatusProvider.OK:
                sendOk(res, AppResponse.message, AppResponse.data, AppResponse.meta);
                break;
            default:
                log.warn(StatusProvider.WRONG, target);
        }
    }

    function sendError(res, message){
        res.json({status: StatusProvider.FAILED, message: message});
        log.warn('Request processed - ' + StatusProvider.FAILED + ', ' + message, target);
    }

    function sendOk(res, message, data, meta){
        res.json({status: StatusProvider.OK, message: message, data: data, meta: meta});
        log.info('Request processed - ' + StatusProvider.OK, target);
    }
}

module.exports=Router;