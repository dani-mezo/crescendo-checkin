'use strict';

angular.module('crescendo-checkin.secondary', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/secondary', {
    templateUrl: 'secondary/secondary.html',
    controller: 'SecondaryController'
  });
}])

.controller('SecondaryController',
    function($scope, $location, connectionProvider, storageProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider, $rootScope) {
        var target = 'SecondaryController';

        var vm = $scope;

        if(!storageProvider.get(constProvider.ROLE)){
            $location.path('/login');
        }

        console.log('SecondaryController')

        vm.name = storageProvider.get(constProvider.NAME);

        vm.logout = logout;

        function logout(){
            storageProvider.clear();
            notifyProvider.success('Successfully logged out!');
            $location.path('/');
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