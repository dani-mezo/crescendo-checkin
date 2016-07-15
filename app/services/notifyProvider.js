/**
 * Created by S on 2016. 07. 12..
 */

angular.module('crescendo-checkin')
    .service('notifyProvider', function (notify){

        var OK = "ok";
        var FAILED = "failed";

        function info(message, duration, position){
            pureNotify(message, 'alert-info', duration, position);
        }

        function success(message, duration, position){
            pureNotify(message, 'alert-success', duration, position);
        }

        function warn(message, duration, position){
            pureNotify(message, 'alert-warning', duration, position);
        }

        function err(message, duration, position){
            pureNotify(message, 'alert-danger', duration, position);
        }

        function pureNotify(message, type, duration, position){
            duration = duration || 5000;
            position = position || 'center';

            notify({
                message: message,
                classes: type,
                position: position,
                duration: duration
            });
        }

        function responseNotify(reponse){
            var stat = Number(reponse.status);

            switch(stat){
                case OK:
                    success(stat.message);
                    break;
                case FAILED:
                    err(stat.message);
                    break;
                default:
                    info(stat.message);
            }
        }

        return {
            info: info,
            success: success,
            warn: warn,
            err: err,
            responseNotify: responseNotify
        }
    });

