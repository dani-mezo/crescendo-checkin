
angular.module('crescendo-checkin')
.service('connectionProvider', function connectionProvider($timeout, log, $rootScope){
        var target = 'connectionProvider';
        var socket = io();
        var handlers = [];


        $timeout(function(){
            applyEarlyHandlers();
        });

        function applyEarlyHandlers(){
            _.forEach(handlers, function(handler){
                addHandler(handler.name, handler._handler);
            });
        }

        function emit(event, data){
            socket.emit(event, data);
        }

        function addHandler(event, handler){
            if(!socket){
                log.warn('Socket is not initialized - Handler scheduled', target);
                handlers.push({name: event, _handler: handler});
                return;
            }
            socket.on(event, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    handler.apply(socket, args);
                });
            });
        }

        function removeHandler(){
            //TODO
        }

        return {
            emit: emit,
            addHandler: addHandler,
            removeHandler: removeHandler
        }
});