
angular.module('crescendo-checkin')
    .service('storageProvider', function() {
        return storageProvider();
});


function storageProvider($timeout){

    var _name = 'storageProvider';

    var storage = localStorage;

    function set(name, value){
        storage[name] = value;
    }

    function get(name){
        if(!name || !storage[name]){
            return;
        }
        return storage[name];
    }

    function getNumber(name){
        if(!name || !storage[name]){
            return;
        }
        return Number(storage[name]);
    }

    function clear(){
        storage.clear();
    }

    return {
        get: get,
        set: set,
        getNumber: getNumber,

        clear: clear
    }
}