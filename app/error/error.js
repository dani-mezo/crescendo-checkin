'use strict';

angular.module('crescendo-checkin.error', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/error', {
    templateUrl: 'error/error.html',
    controller: 'ErrorController'
  });
}])

.controller('ErrorController',
    function($scope, $location, connectionProvider, storageProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider) {
        var target = 'ErrorController';

        var vm = $scope;

        console.log('ErrorController')
});