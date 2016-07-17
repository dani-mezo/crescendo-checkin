/**
 * Created by S on 2016. 07. 03..
 */
var hash = require('password-hash');

var SocketService = function(log, io, IdentityService, EventProvider, RoleProvider, _) {

    var target = "SocketService";

    var primaries = [];
    var secondaries = [];

    io.on('connection', function (socket) {
        log.info("SocketIO connected", target);

        socket.on('REG', function (data){regHandler(data, socket)});

        socket.on('disconnect', function(){
           //TODO
        });
    });

    function regHandler(data, socket){
        if(data.role === RoleProvider.ZSUZSI){
            zsuzsi = socket;
            issueQueue.forEach(function(issue){
               sendToZsuzsiFromQueue(issue);
            });
        }
        if(data.role === RoleProvider.PRIMARILY){
            primaries.push(socket);
        }
    }


    var crypto = require('crypto');

    var generate_key = function () {
        var sha = crypto.createHash('sha256');
        sha.update(Math.random().toString());
        return sha.digest('hex');
    };


    // ------------ zsuzsi

    var zsuzsi;
    var issueQueue = [];

    function sendToZsuzsiFromQueue(issue){
        if(zsuzsi) zsuzsi.emit('ISSUE', issue);
    }

    function sendToZsuzsi(issue){
        if(!zsuzsi){
            if(!isQueued(issue)){
                issueQueue.push[issue]
                return;
            }
            return;
        }
        zsuzsi.emit('ISSUE', issue);
    }

    function isQueued(issue){
        for(var i in issueQueue){
            if(issueQueue[i].id === issue.id){
                return true;
            }
        }

        return false;
    }

    function issueResolved(id){

        var index = 0;
        for(;index<issueQueue.length; index++){
            if(issueQueue[index].id === id) break;
        }

        if(index > -1) issueQueue.splice(index, 1);

        primaries.forEach(function(primary){
            primary.emit('RESOLVED', {id: id});
        });
    }

    return {
        sendToZsuzsi: sendToZsuzsi,
        issueResolved:issueResolved
    }
}

module.exports=SocketService;