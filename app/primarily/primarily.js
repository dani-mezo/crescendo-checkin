'use strict';

angular.module('crescendo-checkin.primarily', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/primarily', {
    templateUrl: 'primarily/primarily.html',
    controller: 'PrimarilyController'
  });
}])

.controller('PrimarilyController',
    function($scope, $location, connectionProvider, storageProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider, $rootScope,  $q, $log, $mdDialog, roleProvider) {
        var target = 'PrimarilyController';

        if(!storageProvider.get(constProvider.ROLE)){
            $location.path('/login');
        }

        connectionProvider.emit('REG', {role: roleProvider.PRIMARILY});
        connectionProvider.addHandler('RESOLVED', resolvedHandler);

        var ARRIVAL_CHECK = false;

        var vm = $scope;

        vm.name = storageProvider.get(constProvider.NAME);

        vm.logout = logout;
        vm.primarily = [];

        vm.usersAutoComplete = [];
        vm.users = [];

        vm.user = {};

        vm.isDataLoading = true;

        vm.emptySearchString = "A felhasználók betöltése folyamatban van..."

        vm.simpleUser = {};
        vm.simpleUser.secondary = {};

        vm.cancelCheckin = cancelCheckin;
        vm.doneCheckin = doneCheckin;


        function cancelCheckin(){
            vm.doesCheckinStarted = false;
            vm.user = {};
            vm.searchText = '';
        }

        function doneCheckin(){
            var isDone = validateCheckinDone();
            if(isDone){

                $http.post('/primarily', {user: vm.simpleUser}).then(handlePrimarilyDone, errorCallback);

                cancelCheckin();
            } else {
                notifyProvider.err('Néhány attribútum hiányzik a folytatáshoz!');
            }
        }

        function handlePrimarilyDone(response){
            if(response.data.status === 'ok'){
                notifyProvider.success('Check-in folyamat sikeresen mentve!');
            }
        }

        function resolvedHandler(data){
            var user = _.find(vm.users, function(user){
               return user.id === data.id;
            });

            user.isSignedByZsuzsi = true;
            vm.usersMapped[user.id] = user;
        }

        function validateCheckinStart(){

            if(vm.user.isSignedByZsuzsi){
                return true;
            }

            var isArrivalOK = validateArrival();
            var isDebitOK = validateDebit();
            var isRoleOK = validateRole();

            if(!isArrivalOK || !isDebitOK || !isRoleOK){
                var reason = '';
                reason += isArrivalOK ? '' : 'Érkezési idő ';
                reason += isDebitOK ? '' : 'Tartozás ';
                reason += isRoleOK ? '' : 'Role ';

                showAlert(reason);

                var data = {
                    id: vm.user.id,
                    name: vm.user.firstname + ' ' + vm.user.lastname,
                    isArrivalOK: isArrivalOK,
                    isDebitOK: isDebitOK,
                    isRoleOK: isRoleOK,
                    arrival: vm.user.arrival,
                    debit: vm.user.tartozas
                }
                $http.post('/zsuzsi', data).then(handleZsuzsi, errorCallback);

                return false;
            }

            return true;
        }

        function handleZsuzsi(response){
            if(response.data.status === 'ok'){
                notifyProvider.success('Zsuzsinak elküldve!');
            }
        }

        function validateArrival(){
            if(!ARRIVAL_CHECK) return true;

            if(!vm.user.arrival) return false;
            if(!(new Date(vm.user.arrival))) return false;
            if((new Date(vm.user.arrival)).getTime() > Date.now()) return false;

            return true;
        }

        function validateDebit(){
            if(vm.user.tartozas === 0) return true;
            return false;
        }

        function validateRole(){
            if(vm.user.role) return true;
            return false;
        }

        function showAlert(reason) {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title("Ó jaj!")
                    .textContent('A felhasználó Check-in folyamatát nem lehet megindítani! A probléma forrása(i):' + reason)
                    .ariaLabel('Hiba')
                    .ok('Elküldöm Zsuzsihoz!')
            );
        }

        function collectSimpleUser(){
            vm.simpleUser.input = {};
            vm.simpleUser.input.leaveDate = '';

            vm.simpleUser.input.checkedDeposit = false;
            vm.simpleUser.input.checkedIFA = false;
            vm.simpleUser.input.checkedANTSZ = false;
            vm.simpleUser.input.checkedParentDeclaration = false;
            vm.simpleUser.input.checkedDiet = false;

            vm.simpleUser.name = vm.user.firstname + ' ' + vm.user.lastname;
            vm.simpleUser.isAdult = getIsAdult(vm.user.birthdate);

            vm.simpleUser.diet = '';
            vm.simpleUser.diet += (vm.user.diet_vega === 1) ? 'v ' : '';
            vm.simpleUser.diet += (vm.user.diet_sea_food === 1) ? 'sf ' : '';
            vm.simpleUser.diet += (vm.user.diet_lactose === 1) ? 'l ' : '';
            vm.simpleUser.diet += (vm.user.diet_gluten === 1) ? 'g ' : '';
            vm.simpleUser.diet += (vm.user.allergia_other) ? 'o ' : '';
        }

        function validateCheckinDone(){

            var isNOTIFA = getIsAdult(vm.user.birthdate) && !vm.simpleUser.input.checkedIFA;
            var isNOTANTSZ = !getIsAdult(vm.user.birthdate) && (!vm.simpleUser.input.checkedANTSZ || !vm.simpleUser.input.checkedParentDeclaration);
            var isNOTLeaveDate = !vm.simpleUser.input.leaveDate;
            var isNOTDiet = !vm.simpleUser.input.checkedDiet;
            var isNOTDeposit = !vm.simpleUser.input.checkedDeposit;

            if(isNOTIFA || isNOTANTSZ || isNOTLeaveDate || isNOTDiet || isNOTDeposit) return false;

            return true;
        }

        function calculateAge(birthday) {
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        function getIsAdult(date){
            var birthdate = new Date(date);
            if(!date || !birthdate) return true;
            return calculateAge(new Date(date)) >= 18;
        }

        function handleIsCheckinValid(isValid){
            if(!isValid) vm.doesCheckinStarted = false;
            else {
                collectSimpleUser();
                vm.doesCheckinStarted = true;
            }
        }

        $http.get('/primarily').then(handlePrimarily, errorCallback);
        $http.get('/users').then(handleUsers, errorCallback);
        notifyProvider.info('A felhasználók betöltése folyamatban van...', 15000);

        function handlePrimarily(response){
            vm.primarily = response.data;
        }

        function handleUsers(response){

            notifyProvider.clear();

            vm.users = response.data.data;
            _.remove(vm.users, function(user){
                if(!user.firstname.trim() && !user.lastname.trim()) return true;
            });
            vm.usersAutoComplete = vm.users.map(function(user){
                return {
                    value: user.id,
                    display: user.firstname + ' ' + user.lastname
                }
            });

            vm.usersMapped = {};

            _.forEach(vm.users, function(user){
               vm.usersMapped[user.id] = user;
            });

            vm.isDataLoading = false;
            vm.states = vm.usersAutoComplete;
            vm.emptySearchString = "Nem található a keresett felhasználó...";
            notifyProvider.success('A felhasználók sikeresen betöltődtek!');
        }

        function errorCallback(response){
            console.error(response);
        }

        function logout(){
            storageProvider.clear();
            notifyProvider.success('Successfully logged out!');
            $location.path('/');
        }




        vm.simulateQuery = false;
        vm.doesCheckinStarted    = false;

        // list of `state` value/display objects
        vm.states        = [];
        vm.querySearch   = querySearch;
        vm.selectedItemChange = selectedItemChange;
        vm.searchTextChange   = searchTextChange;

        // ******************************
        // Internal methods
        // ******************************

        /**
         * Search for states... use $timeout to simulate
         * remote dataservice call.
         */
        function querySearch (query) {
            var results = query ? filterForUsers(query) : vm.states;

            return results;
        }

        function searchTextChange(text) {
        }

        function selectedItemChange(item) {
            if(!item) return;
            vm.user = vm.usersMapped[item.value];
            var isValid = validateCheckinStart();
            handleIsCheckinValid(isValid);
        }

        function filterForUsers(text){
            var results = [];
            results = results.concat(addFullNameResults(text));
            return results;
        }

        function addFullNameResults(text){
            var results = [];
            for(var i in vm.usersAutoComplete){
                if(vm.usersAutoComplete[i].display.toLowerCase().indexOf(text.toLowerCase()) > -1) results.push(vm.usersAutoComplete[i]);
            }
            return results;
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