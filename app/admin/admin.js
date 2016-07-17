'use strict';

angular.module('crescendo-checkin.admin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/admin', {
    templateUrl: 'admin/admin.html',
    controller: 'AdminController'
  });
}])

.controller('AdminController', function($scope, $http, _, $mdDialog, storageProvider, notifyProvider, $location, util, $rootScope) {
        var vm = $scope;

        var isCheckinView = true;
        var isVolunteerManagementView = false;
        var isCrescendoPeopleView = false;

        var checkin = {};
        checkin.primarily = [];
        checkin.secondary = [];

        var primarily = {};
        var secondary = {};
        var secondaryPicked = {};

        var volunteers = {};
        var volunteersAutoComplete = {};
        var pickedVolunteers = {};

        function setCheckinView(){
            vm.isCheckinView = true;
            vm.isVolunteerManagementView = false;
            vm.isCrescendoPeopleView = false;
        }
        function setVolunteerManagementView(){
            vm.isCheckinView = false;
            vm.isVolunteerManagementView = true;
            vm.isCrescendoPeopleView = false;
        }
        function setCrescendoPeopleView(){
            vm.isCheckinView = false;
            vm.isVolunteerManagementView = false;
            vm.isCrescendoPeopleView = true;
        }

        vm.getVolunteers = function() {
            $http.get('/volunteers').then(successCallback, errorCallback);
        }

        function successCallback(response){
            console.log(response);
        }

        function errorCallback(response){
            console.error(response);
        }

        function removePrimarily(username){
            _.remove(vm.checkin.primarily, function(uname){
                return uname === username;
            });
            pickedVolunteers[username] = {};
            var volunteer = volunteers[username];
            volunteersAutoComplete.push({value: username, display: volunteer.firstname + ' ' + volunteer.lastname});

        }

        function removeSecondary(username){
            _.remove(vm.checkin.secondary, function(volunteer){
                if(volunteer.username === username){
                    _.forEach(volunteer.attributes, function(attr){
                        secondaryPicked[attr] = false;
                    });
                    return true;
                }
            });
            pickedVolunteers[username] = {};
            var volunteer = volunteers[username];
            volunteersAutoComplete.push({value: username, display: volunteer.firstname + ' ' + volunteer.lastname});
        }

        function openDialog($event) {
            $mdDialog.show({
                controller: DialogCtrl,
                controllerAs: 'ctrl',
                templateUrl: '/admin/addPrimarily.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                clickOutsideToClose:true
            })
        }


        function openSecondary($event) {
            $mdDialog.show({
                controller: SecondaryCtrl,
                controllerAs: 'ctrl',
                templateUrl: '/admin/addSecondary.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                clickOutsideToClose:true
            })
        }



        vm.isCheckinView = isCheckinView;
        vm.isVolunteerManagementView = isVolunteerManagementView;
        vm.isCrescendoPeopleView = isCrescendoPeopleView;

        vm.setCheckinView = setCheckinView;
        vm.setVolunteerManagementView = setVolunteerManagementView;
        vm.setCrescendoPeopleView = setCrescendoPeopleView;

        vm.checkin = checkin;

        vm.removePrimarily = removePrimarily;
        vm.removeSecondary = removeSecondary;

        vm.openDialog = openDialog;
        vm.openSecondary = openSecondary;

        vm.volunteers = volunteers;
        vm.volunteersAutoComplete = volunteersAutoComplete;
        vm.pickedVolunteers = pickedVolunteers;

        vm.attrRemoved = attrRemoved;

        vm.logout = logout;

        $http.get('/volunteers').then(handleVolunteers, errorCallback);


        function logout(){
            storageProvider.clear();
            notifyProvider.success('Successfully logged out!');
            $location.path('/');
        }

        function handleCheckinConfig(response){

            console.log(response);

            _.forEach(response.data.data.primarily, function(username){
                _.remove(volunteersAutoComplete, function(volunteer){
                   return volunteer.value === username;
                });
            });

            _.forEach(response.data.data.secondary, function(obj){
                _.remove(volunteersAutoComplete, function(volunteer){
                    return volunteer.value === obj.username;
                });

                _.forEach(obj.attributes, function(attr){
                    secondaryPicked[attr] = true;
                });
            });
            
            vm.checkin = response.data.data;

        }

        function attrRemoved(attr, username){
            var volunteer = _.find(vm.checkin.secondary, function(volunteer){
                return volunteer.username === username;
            });

            if(volunteer.attributes.length === 0){
                removeSecondary(username);
            }

            secondaryPicked[attr] = false;
        }

        function handleVolunteers(response){

            _.forEach(response.data.data, function(volunteer){
                volunteers[volunteer.username] = volunteer;
            });

            volunteersAutoComplete = response.data.data.map(function(volunteer){
                return {
                    value: volunteer.username,
                    display: volunteer.firstname + ' ' + volunteer.lastname
                }
            });

            $http.get('/checkin/config').then(handleCheckinConfig, errorCallback);
        }


        function handleSecondary(response){
            vm.secondary = response.data.data;

            if(util.isEmpty(secondaryPicked)){
                _.forOwn(vm.secondary, function(value, key){
                    secondaryPicked[value] = false;
                });
            }
        }

        function handlePrimarily(response){
            vm.primarily = response.data.data;
        }

        function checkValidConfig(){

            if(vm.checkin.primarily.length === 0) return false;

            var isAnyAttributeNotAssigned = _.some(secondaryPicked, function(value, key){
                return value === false;
            });
            if(isAnyAttributeNotAssigned || !secondaryPicked) return false;

            return true;
        }

        function handleValidCheckin(message){
            $http.post('/checkin/config', {checkin: vm.checkin}).then(function(){
                handleSavedConfig(message);
            }, errorCallback);
        }

        function handleSavedConfig(message){
            message = message || 'Configuration autosaved.'
            notifyProvider.success(message);
        }


        function DialogCtrl ($timeout, $q, $scope, $mdDialog) {
            var self = this;

            // list of `state` value/display objects
            self.states = loadAll();
            self.querySearch = querySearch;
            self.selectedItemChange = selectedItemChange;
            var selectedItem;

            // ******************************
            // Template methods
            // ******************************

            self.cancel = function ($event) {
                $mdDialog.cancel();
            };
            self.finish = function ($event) {

                if(selectedItem) {
                    vm.checkin.primarily.push(selectedItem.value);
                    pickedVolunteers[selectedItem.value] = volunteers[selectedItem.value];
                    _.remove(volunteersAutoComplete, function(obj){
                        return obj.value === selectedItem.value;
                    });
                }

                var isValid = checkValidConfig();

                if(isValid) handleValidCheckin();

                $mdDialog.hide();
            };

            function selectedItemChange(item){
                selectedItem = item;
            }


            // ******************************
            // Internal methods
            // ******************************

            /**
             * Search for states... use $timeout to simulate
             * remote dataservice call.
             */
            function querySearch(query) {
                return query ? self.states.filter(createFilterFor(query)) : self.states;
            }

            /**
             * Build `states` list of key/value pairs
             */
            function loadAll() {
                return volunteersAutoComplete;
            }
        }


        function SecondaryCtrl ($timeout, $q, $scope, $mdDialog) {
            var self = this;

            // list of `state` value/display objects
            self.states = loadAll();
            self.querySearch = querySearch;
            self.selectedItemChange = selectedItemChange;
            var selectedItem;

            self.secondary = [];
            self.secondaryPicked = secondaryPicked;

            self.checked = checked;

            $http.get('/primarily').then(handlePrimarilyInDialog, errorCallback);
            $http.get('/secondary').then(handleSecondaryInDialog, errorCallback);

            function handleSecondaryInDialog(response){
                self.secondary = response.data.data;
                handleSecondary(response);
            }

            function handlePrimarilyInDialog(response){
                handlePrimarily(response);
            }

            self.collectSecondary = [];

            function checked(sec){

                if(secondaryPicked[sec]){
                    return;
                }

                var isCollected = _.some(self.collectSecondary, function(s){
                    return sec === s;
                });

                if(isCollected){
                    _.remove(self.collectSecondary, function(s){
                        return sec === s;
                    });

                } else {
                    self.collectSecondary.push(sec);
                }
            }

            // ******************************
            // Template methods
            // ******************************

            self.cancel = function ($event) {
                $mdDialog.cancel();
            };

            self.finish = function ($event) {

                if(self.collectSecondary.length === 0 || !selectedItem){
                    $mdDialog.hide();
                    return;
                }

                _.forEach(self.collectSecondary, function(sec){
                    secondaryPicked[sec] = true;
                });

                if(selectedItem) {
                    vm.checkin.secondary.push({username: selectedItem.value, attributes: self.collectSecondary});
                    pickedVolunteers[selectedItem.value] = volunteers[selectedItem.value];
                    _.remove(volunteersAutoComplete, function(obj){
                       return obj.value === selectedItem.value;
                    });
                }

                var isValid = checkValidConfig();

                if(isValid) handleValidCheckin();

                $mdDialog.hide();
            };

            function selectedItemChange(item){
                selectedItem = item;
            }

            // ******************************
            // Internal methods
            // ******************************

            /**
             * Search for states... use $timeout to simulate
             * remote dataservice call.
             */
            function querySearch(query) {
                return query ? self.states.filter(createFilterFor(query)) : self.states;
            }

            /**
             * Build `states` list of key/value pairs
             */
            function loadAll() {
                return volunteersAutoComplete;
            }
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(volunteer) {
                return (volunteer.value.indexOf(lowercaseQuery) === 0) || (volunteer.display.indexOf(lowercaseQuery) === 0);
            };

        }


        $rootScope.$on('$routeChangeStart', function (ev, to, toParams, from, fromParams) {
            if(!storageProvider.get(constProvider.ROLE)){
                $location.path('/login');
            }
            if ($location.url() !== '/' + storageProvider.get(constProvider.ROLE)) {
                $location.path(storageProvider.get(constProvider.ROLE));
            }
        });
});