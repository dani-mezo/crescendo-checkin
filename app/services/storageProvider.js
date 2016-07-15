
angular.module('crescendo-checkin')
    .service('storageProvider', function() {
        return storageProvider();
});


function storageProvider($timeout){

    var _name = 'storageProvider';

    var storage = localStorage;

    function set(name, value){
        storage.name = value;
    }

    function get(name){
        if(!name || !storage.name){
            console.error('ERROR: cannot get value from the storage - ' + _name);
            return;
        }
        return storage.name;
    }

    function getNumber(name){
        if(!name || !storage.name){
            console.error('ERROR: cannot get value from the storage - ' + _name);
            return;
        }
        return Number(storage.name);
    }

    return {
        get: get,
        set: set,
        getNumber: getNumber
    }
}