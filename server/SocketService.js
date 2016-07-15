/**
 * Created by S on 2016. 07. 03..
 */
var hash = require('password-hash');

var SocketService = function(log, io, IdentityService, EventProvider, RoleProvider) {

    var target = "SocketService";

    io.on('connection', function (socket) {
        log.info("SocketIO connected", target);
        socket.emit('auth');

        socket.on('token_check', function (data) {
            //TODO
        });

        socket.on(EventProvider.LOGIN, loginHandler);
        socket.on(EventProvider.SIGNUP, signupHandler);



        function loginHandler(data) {
            IdentityService.authenticate(data.username, data.password, identityHandler);

            function identityHandler(identity) {
                if (identity.authenticated) {
                    socket.emit(EventProvider.REDIRECT, {
                        authenticated: identity.authenticated,
                        role: identity.role,
                        token: identity.token
                    });
                }
            }
        }

        function signupHandler(data) {
            IdentityService.newIdentity(data.username, data.password, identityCreationHandler)

            function identityCreationHandler(status) {
                socket.emit(EventProvider.STATUS, {status: status});
            }
        }


        socket.on('checkadmin', function (data) {
            if (data.token === admin['token']) {
                socket.emit('checkedAdmin', {isAdmin: 'true'});
                socket.emit('attributes', {attr: admin.setAttributes});
                socket.emit('recentlyUsedVolunteers', {recentlyUsedVolunteers: recentlyUsedVolunteers});
                socket.emit('isAll', {isAll: admin.isAll});
            } else {
                socket.emit('checkedAdmin', {isAdmin: 'false'});
            }
        });

        socket.on('checkuser', function (data) {
            isExist = false;
            for (var key in volunteers) {
                if (volunteers[key].token === data.token) {
                    socket.emit('userinfo', {user: volunteers[key]});
                    socket.emit('welcome', {
                        notifyString: "Welcome " + volunteers[key].name_first + " " + volunteers[key].name_first + "!",
                        isError: false
                    });
                    isExist = true;
                }
                if (!isExist) socket.emit('redirect', {url: 'checkin.html', token: ''});
            }
        });

        socket.on('createdVolunteer', function (data) {
            //volunteers[data.u_name] = new volunteer(data.first_name, data.second_name, data.u_name, hash.generate(data.password));
        });


        //registration testing
        socket.on('save', function (data) {
            for (var i in database) {
                if (database[i].name_first == data.name_first && database[i].name_second == data.name_second) {
                    socket.emit('failedsave', data);
                    return;
                }
            }
            id = shortid.generate();
            database[id] = (new people(id, data.name_first, data.name_second, data.nationality, data.food, data.department, data.room));
            socket.emit('saved');
            for (var i in database) console.log(database[i]);
        });

        socket.on('autocompleterequest', function (data) {
            if (data.text == "") return;
            var results = {};
            for (var key in volunteers) {
                var name = volunteers[key].fullname + " (" + volunteers[key].username + ")";
                if (name.toLowerCase().indexOf(data.text.toLowerCase()) > -1) {
                    results[key] = name;
                }
            }
            socket.emit('autocompleted', {hints: results});
        });

        socket.on('personRequest', function (data) {
            socket.emit('person', {person: database[data.id]});
        });

        socket.on('setAttributes', function (data) {
            admin.setAttributes = data.attr;
        });


        socket.on('getAttributes', function () {
            socket.emit('attributes', {attr: admin.setAttributes});
        });

        socket.on('setStations', function (data) {
            stations = data.stations;
        });

        socket.on('removeStations', function () {
            stations = [];
            socket.emit('stations', {stations: stations});
            socket.emit('notify', {notifyString: "Successfully removed all stations!", isError: false});
        });

        socket.on('getStations', function () {
            socket.emit('stations', {stations: stations});
        });

        socket.on('isAllChange', function () {
            if (admin.isAll === true) {
                admin.isAll = false;
            } else {
                admin.isAll = true;
            }
        });

        socket.on('selectedVolunteer', function (data) {
            for (var key in recentlyUsedVolunteers) {
                if (data.username === recentlyUsedVolunteers[key].username) {
                    recentlyUsedVolunteers.splice(key, 1);
                    recentlyUsedVolunteers.push(data);
                    socket.emit('recentlyUsedVolunteers', {recentlyUsedVolunteers: recentlyUsedVolunteers});
                    return;
                }
            }
            if (recentlyUsedVolunteers.length >= 10) {
                recentlyUsedVolunteers = recentlyUsedVolunteers.splice(1, recentlyUsedVolunteers.length - 1);
            }
            recentlyUsedVolunteers.push(data);
            socket.emit('recentlyUsedVolunteers', {recentlyUsedVolunteers: recentlyUsedVolunteers});
        });
    });


    var crypto = require('crypto');

    var generate_key = function () {
        var sha = crypto.createHash('sha256');
        sha.update(Math.random().toString());
        return sha.digest('hex');
    };
}

module.exports=SocketService;