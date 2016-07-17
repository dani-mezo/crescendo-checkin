'use strict';

angular.module('crescendo-checkin.login', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login/login.html',
    controller: 'LoginController'
  });
}])

.controller('LoginController',
    function($scope, $location, connectionProvider, storageProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider, $rootScope, roleProvider) {
        var target = 'LoginController';

        var vm = $scope;

        vm.username = "";
        vm.password = "";

        resetSignUp();

        vm.isLoginView = true;
        vm.isSignupView = false;

        autoLogin();

        function login(){
          if(vm.username && vm.password){
              var data = {
                  username: vm.username,
                  password: vm.password
              }
              $http.post('/login', data).then(handleLoginResponse, errorCallback);
          }
        }

        function autoLogin(){
            var token = storageProvider.get(constProvider.TOKEN);
            var username = storageProvider.get(constProvider.USERNAME);
            if(token && username){
                var data = {token: token, username: username};
                $http.post('/token', data).then(handleAutoLoginResponse, errorCallback);
            }
        }

        function handleAutoLoginResponse(res){

            var response = res.data;

            if (response.status === statusProvider.OK) {

                standardLogin(response);
            }
        }

        function handleLoginResponse(res) {
            var response = res.data;

            if (response.status === statusProvider.OK) {

                standardLogin(response);

            } else {
                if(response.message){
                    notifyProvider.err(response.message);
                } else {
                    notifyProvider.err("Something went wrong!");
                }
            }
        }

        function standardLogin(response){
            var volunteer = response.data;
            var meta = response.meta;
            var message = response.message;

            console.log(response)
            if(meta.role !== roleProvider.UNKNOWN) {
                storageProvider.set(constProvider.TOKEN, meta.token);
                storageProvider.set(constProvider.FIRSTNAME, volunteer.firstname);
                storageProvider.set(constProvider.LASTNAME, volunteer.lastname);
                storageProvider.set(constProvider.USERNAME, volunteer.username);
            }
            storageProvider.set(constProvider.ROLE, meta.role);
            storageProvider.set(constProvider.NAME, volunteer.firstname + ' ' + volunteer.lastname);


            $location.path(meta.role);

            notifyProvider.success(message);

            setTimeout(function(){
                notifyProvider.success('Welcome ' + volunteer.firstname + ' ' + volunteer.lastname + '!');
            }, 2000);

            scopeListener();
        }

        function scopeListener(){
            $rootScope.$on('$routeChangeStart', function (ev, to, toParams, from, fromParams) {
                if(!storageProvider.get(constProvider.ROLE)){
                    $location.path('/login');
                }
                if ($location.url() !== '/' + storageProvider.get(constProvider.ROLE)) {
                    $location.path(storageProvider.get(constProvider.ROLE));
                }
            });
        }

        function signup(){
            if(valid()){
                var data = {
                    firstname: vm.signup_firstname,
                    lastname: vm.signup_lastname,
                    username: vm.signup_username,
                    password: vm.signup_password
                }

                $http.post('/volunteers', data).then(successCallback, errorCallback);
            }
        }

        function successCallback(response){
            console.log(response.data.status)
            switch(response.data.status){
                case statusProvider.OK:
                    notifyProvider.success(response.data.message);
                    resetSignUp();
                    break;
                case statusProvider.FAILED:
                    notifyProvider.err(response.data.message);
                    break;
                default:
                    notifyProvider.info(response.data.message);
            }
        }

        function resetSignUp(){
            vm.signup_firstname = "";
            vm.signup_lastname = "";
            vm.signup_username = "";
            vm.signup_password = "";
            vm.signup_password_confirm = "";
        }

        function errorCallback(response){
            console.error(response);
        }

        function switchLogin(){
            vm.isLoginView = !vm.isLoginView;
            vm.isSignupView = !vm.isSignupView;
        }

        function valid(){
            var firstname = vm.signup_firstname;
            var lastname = vm.signup_lastname;
            var username = vm.signup_username;
            var password = vm.signup_password;
            var password_confirm = vm.signup_password_confirm;

            if(!username || !password || !password_confirm || !firstname || !lastname) {
                handleValidationError(reasonProvider.EMPTY_INPUT);
                return false;
            }

            if(password !== password_confirm) {
                handleValidationError(reasonProvider.NOT_SAME_PASS);
                return false;
            }

            return true;
        }

        function handleValidationError(msg){
            log.warn('Validation error - ' + msg, target);
            //TODO
        }


        vm.login = login;
        vm.signup = signup;
        vm.switchLogin = switchLogin;
});