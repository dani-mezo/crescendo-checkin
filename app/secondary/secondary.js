'use strict';

angular.module('crescendo-checkin.secondary', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/secondary', {
    templateUrl: 'secondary/secondary.html',
    controller: 'SecondaryController'
  });
}])

.controller('SecondaryController',
    function($scope, $location, connectionProvider, storageProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider) {
        var target = 'SecondaryController';

        var vm = $scope;

        console.log('SecondaryController')
});