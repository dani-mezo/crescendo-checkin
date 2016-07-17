'use strict';

angular.module('crescendo-checkin.error', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/error', {
    templateUrl: 'error/error.html',
    controller: 'ErrorController'
  });
}])

.controller('ErrorController',
    function($scope, $location, connectionProvider, storageProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider, $rootScope) {
        var target = 'ErrorController';

        if(!storageProvider.get(constProvider.ROLE)){
            $location.path('/login');
        }

        var vm = $scope;

        console.log('ErrorController')

        $rootScope.$on('$routeChangeStart', function (ev, to, toParams, from, fromParams) {
            if(!storageProvider.get(constProvider.ROLE)){
                $location.path('/login');
            }
            if ($location.url() !== '/' + storageProvider.get(constProvider.ROLE)) {
                $location.path(storageProvider.get(constProvider.ROLE));
            }
        });
});