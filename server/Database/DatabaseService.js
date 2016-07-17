/**
 * Created by S on 2016. 07. 03..
 */

var Volunteer = require('./Model/Volunteer');
var PublicVolunteer = require('./Model/PublicVolunteer');
var hash = require('password-hash');
var crypto = require('crypto');

var DatabaseService = function(log, RoleProvider, StatusProvider, DatabaseErrorProvider, ResponseProvider, DefaultProvider, CheckinService) {

    var target = "DatabaseService";

    //-- Collections

    var users;
    var volunteers;

    var ADMIN = new Volunteer(RoleProvider.ADMIN, '', hash.generate(DefaultProvider.ADMIN_PASS), RoleProvider.ADMIN);
    var PUBLIC_ADMIN = new PublicVolunteer(ADMIN);
    var ZSUZSI = new Volunteer(RoleProvider.ZSUZSI, '', hash.generate(DefaultProvider.ZSUZSI_PASS), RoleProvider.ZSUZSI);
    var PUBLIC_ZSUZSI = new PublicVolunteer(ZSUZSI);

    ADMIN.token = '';
    ZSUZSI.token = '';


    //-- Environment config, for OPENSHIFT

    var connection_string = '127.0.0.1:27017/';
    if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
        connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
    }

    //-- Connect to MongoDB

    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect('mongodb://' + connection_string, function(err, db) {

        if(err) {
            log.err("Failed to connect to MongoDB", target);
            return;
        }

        users = db.collection('users');
        volunteers = db.collection('volunteers');

        //volunteers.remove();
        //users.remove();

        log.info("Successfully connected to MongoDb", target);
    });

    // -- Interface implementation

    //******************************************************************************** Volunteers

    function insertVolunteer(firstname, lastname, rarepassword, username, callback){

        var hashedpassword = hash.generate(rarepassword);
        var volunteer = new Volunteer(firstname, lastname, hashedpassword, username);

        if(!volunteers){
            return collectionFailure(callback);
        }

        getVolunteer(username, function(status){
            if(status.status === StatusProvider.FAILED && status.message !== DatabaseErrorProvider.DB_ERROR){
                pureInsertVolunteer(volunteer, callback);
            } else if (status.message !== DatabaseErrorProvider.DB_ERROR) {
                callback({status: StatusProvider.FAILED, message: ResponseProvider.USER_EXISTS, data: ''});
            }
        });
    }

    function pureInsertVolunteer(volunteer, callback){
        if(!volunteers) return;

        volunteers.insert(volunteer, function(err, records){
            var status;
            var message;
            if(err){
                message = DatabaseErrorProvider.DB_ERROR;
                log.err(message, target);
                status = StatusProvider.FAILED;
            } else {
                message = ResponseProvider.SUCCESS_SIGN_UP;
                log.info(message, target);
                status = StatusProvider.OK;
            }

            callback({status: status, message: message, data: ''});
        });
    }

    function getVolunteer(username, callback){
        if(!volunteers) return;

        volunteers.find({username: username}, {_id:0}).toArray(function (err, volunteers) {
            if(err){
                log.err(err);
                return callback({status: StatusProvider.FAILED, message: DatabaseErrorProvider.DB_ERROR});
            }

            if(volunteers[0]){
                return callback({status: StatusProvider.OK, message: "Volunteer found", data: volunteers[0]});
            } else {
                callback({status: StatusProvider.FAILED, message: "No volunteer was found"});
            }
        });
    }

    function getVolunteers(callback){
        if(!volunteers){
            return collectionFailure(callback);
        }

        volunteers.find({}, {_id:0, password:0}).toArray(function (err, volunteers) {
            var message;
            var status;
            if (err) {
                message = DatabaseErrorProvider.GET_VOLUNTEERS_FAILURE;
                log.err(message, target);
                status = StatusProvider.FAILED;
            } else {
                message = DatabaseErrorProvider.GET_VOLUNTEERS_SUCCESS;
                log.info(message, target);
                status = StatusProvider.OK;
            }

            callback({status: status, message: message, data: volunteers});
        });
    }

    function getUsers(callback){
        if(!users){
            return collectionFailure(callback);
        }

        users.find({}, {_id:0}).toArray(function (err, users) {
            var message;
            var status;
            if (err) {
                message = DatabaseErrorProvider.GET_USERS_FAILURE;
                log.err(message, target);
                status = StatusProvider.FAILED;
            } else {
                message = DatabaseErrorProvider.GET_USERS_SUCCESS;
                log.info(message, target);
                status = StatusProvider.OK;
            }

            callback({status: status, message: message, data: users});
        });
    }

    function saveUsers(ss, callback){
        if(!users) return;
        users.remove();

        users.insert(ss, function(err, records){
            if(err){
                callback({status: StatusProvider.FAILED, message: DatabaseErrorProvider.DB_ERROR});
            } else {
                callback({status: StatusProvider.OK, message: 'Users loaded successfully'});
            }
        });
    }

    function saveUser(user, callback){
        if(!users) return;

        users.insert(user, function(err, records){
            if(err){
                console.log(err);
                callback({status: StatusProvider.FAILED, message: DatabaseErrorProvider.DB_ERROR});
            } else {
                callback({status: StatusProvider.OK, message: 'User ' + user.name_full + ' loaded successfully'});
            }
        });
    }

    function authenticateVolunteer(username, password, callback){

        if(!users) return;

        if(username === RoleProvider.ADMIN) {
            handleAdmin(password, callback);
            return;
        }
        if(username === RoleProvider.ZSUZSI) {
            handleZsuzsi(password, callback);
            return;
        }

        function handleVolunteer(status){
            if(status.status === StatusProvider.OK){

                var volunteer = status.data;

                if(hash.verify(password, volunteer.password)){

                    log.info(ResponseProvider.SUCCESS_LOGIN, target);

                    var role = CheckinService.getRole(username);

                    var token = generate_key();

                    saveToken(username, token);

                    var publicVolunteer = new PublicVolunteer(volunteer);

                    callback({status: StatusProvider.OK, message: ResponseProvider.SUCCESS_LOGIN, data: publicVolunteer, meta: {token: token, role: role}});

                } else {
                    log.warn(ResponseProvider.WRONG_PASS, target);
                    callback({status: StatusProvider.FAILED, message: ResponseProvider.WRONG_PASS});
                }
            } else {
                log.warn(ResponseProvider.WRONG_USERNAME, target);
                callback({status: StatusProvider.FAILED, message: ResponseProvider.WRONG_USERNAME});
            }
        }

        getVolunteer(username, handleVolunteer);
    }

    function saveToken(username, token){

        if(!volunteers) return;

        volunteers.updateOne({ username: username }, { $set: { token: token } }, function (err) {
            if (err) {
                log.err('Token update failed', target);
            }
            else {
                log.info('Token update successful', target);
            }
        });
    }

    function authorizeToken(username, token, callback){

        if(!volunteers) return;

        if(username === RoleProvider.ADMIN) {
            handleAdminToken(token, callback);
            return;
        }
        if(username === RoleProvider.ZSUZSI) {
            handleZsuzsiToken(token, callback);
            return;
        }

        volunteers.find({token: token}).toArray(function (err, volunteers) {
            if(err){
                log.err(err);
                return callback({status: StatusProvider.FAILED, message: DatabaseErrorProvider.DB_ERROR});
            }

            if(volunteers[0]){
                return callback({status: StatusProvider.OK, message: ResponseProvider.SUCCESS_LOGIN, data: volunteers[0], meta: {token: volunteers[0].token, role: CheckinService.getRole(username)}});
            } else {
                callback({status: StatusProvider.FAILED, message: "No token was found"});
            }
        });
    }

    function handleAdmin(password, callback){

        log.info('Admin login attempt', target);

        if(hash.verify(password, ADMIN.password)){

            ADMIN.token = generate_key();

            return callback({status: StatusProvider.OK, message: ResponseProvider.SUCCESS_LOGIN, data: PUBLIC_ADMIN, meta: {token: ADMIN.token, role: RoleProvider.ADMIN}});
        }

        callback({status: StatusProvider.FAILED, message: ResponseProvider.WRONG_PASS});
    }

    function handleZsuzsi(password, callback){

        log.info('Zsuzsi login attempt', target);

        if(hash.verify(password, ZSUZSI.password)){

            ZSUZSI.token = generate_key();

            return callback({status: StatusProvider.OK, message: ResponseProvider.SUCCESS_LOGIN, data: PUBLIC_ZSUZSI, meta: {token: ZSUZSI.token, role: RoleProvider.ZSUZSI}});
        }

        callback({status: StatusProvider.FAILED, message: ResponseProvider.WRONG_PASS});
    }


    function handleAdminToken(token, callback){

        log.info('Admin auto login attempt', target);

        if(token === ADMIN.token){

            return callback({status: StatusProvider.OK, message: ResponseProvider.SUCCESS_LOGIN, data: PUBLIC_ADMIN, meta: {token: ADMIN.token, role: RoleProvider.ADMIN}});
        }

        callback({status: StatusProvider.FAILED, message: DatabaseErrorProvider.TOKEN_FAIL_ADMIN});
    }

    function handleZsuzsiToken(token, callback){

        log.info('Zsuzsi auto login attempt', target);

        if(token === ZSUZSI.token){

            return callback({status: StatusProvider.OK, message: ResponseProvider.SUCCESS_LOGIN, data: PUBLIC_ZSUZSI, meta: {token: ZSUZSI.token, role: RoleProvider.ZSUZSI}});
        }

        callback({status: StatusProvider.FAILED, message: DatabaseErrorProvider.TOKEN_FAIL_ZSUZSI});
    }

    function resolveIssue(id){

        if(!users) return;

        log.info('Issue resolved', target);

        users.updateOne({ id: id }, { $set: { isSignedByZsuzsi: true } }, function (err) {
            if (err) {
                log.err('Issue could not been resolved', target);
            }
            else {
                log.info('Issue updated successfully', target);
            }
        });
    }


    //-- Error handling

    function collectionFailure(callback){
        log.err(DatabaseErrorProvider.COLLECTION_FAILURE, target);
        return callback({status: StatusProvider.FAILED , message: DatabaseErrorProvider.COLLECTION_FAILURE});
    }

    function dbValidation(){
        if(!users || !volunteers){
            log.err('Failed to connect to collections', target);
            return false;
        }
        return true;
    }

    var generate_key = function() {
        var sha = crypto.createHash('sha256');
        sha.update(Math.random().toString());
        return sha.digest('hex');
    };

    return {
        insertVolunteer: insertVolunteer,
        getVolunteers: getVolunteers,
        authenticateVolunteer: authenticateVolunteer,
        authorizeToken: authorizeToken,
        getUsers: getUsers,
        saveUser: saveUser,
        saveUsers: saveUsers,
        resolveIssue: resolveIssue
    }
}

module.exports=DatabaseService;