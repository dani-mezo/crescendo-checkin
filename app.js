/**
 * Created by S on 2016. 07. 03..
 */
var target = "App";

var express = require('express');
var app = express();
var router = express.Router();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(__dirname + '/app/'));
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

server.listen(server_port, server_ip_address, "0.0.0.0");

// Require app
var LogService = require('./server/LogService');
var SocketService = require('./server/SocketService');
var DataService = require('./server/DataService');
var DatabaseService = require('./server/Database/DatabaseService');
var IdentityService = require('./server/IdentityService');
var CheckinService = require('./server/CheckinService');
var AppResponse = require('./server/AppResponse');

var EventProvider = require('./server/ConstantProviders/EventProvider');
var RoleProvider = require('./server/ConstantProviders/RoleProvider');
var StatusProvider = require('./server/ConstantProviders/StatusProvider');
var RouterMessageProvider = require('./server/ConstantProviders/RouterMessageProvider');
var DatabaseErrorProvider = require('./server/ConstantProviders/DatabaseErrorProvider');
var ResponseProvider = require('./server/ConstantProviders/ResponseProvider');
var DefaultProvider = require('./server/ConstantProviders/DefaultProvider');
var PrimarilyProvider = require('./server/ConstantProviders/PrimarilyProvider');
var SecondaryProvider = require('./server/ConstantProviders/SecondaryProvider');

var Router = require('./server/Router');

var log = new LogService();

log.info("Listening on: " + server_ip_address + ":" + server_port, target);

// Providers
var statusProvider = new StatusProvider();
var roleProvider = new RoleProvider();
var eventProvider = new EventProvider();
var routerMessageProvider = new RouterMessageProvider();
var databaseErrorProvider = new DatabaseErrorProvider();
var responseProvider = new ResponseProvider();
var defaultProvider = new DefaultProvider();
var primarilyProvider = new PrimarilyProvider();
var secondaryProvider = new SecondaryProvider();

// Instantiate app
var checkinService = new CheckinService(log, roleProvider, secondaryProvider);
var databaseService = new DatabaseService(log, roleProvider, statusProvider, databaseErrorProvider, responseProvider, defaultProvider, checkinService);
var identityService = new IdentityService(log, databaseService, roleProvider, statusProvider, AppResponse, responseProvider, checkinService);
var dataService = new DataService(log, databaseService, roleProvider, statusProvider, AppResponse, primarilyProvider, secondaryProvider, checkinService);

checkinService.setDatabaseService(databaseService);

// Connections
var socketService = new SocketService(log, io, identityService, eventProvider, roleProvider);
var r = new Router(log, router, identityService, dataService, statusProvider, routerMessageProvider);


app.use('/', router);

