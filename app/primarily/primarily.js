'use strict';

angular.module('crescendo-checkin.primarily', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/primarily', {
    templateUrl: 'primarily/primarily.html',
    controller: 'PrimarilyController'
  });
}])

.controller('PrimarilyController',
    function($scope, $location, connectionProvider, storageProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider) {
        var target = 'PrimarilyController';

        var vm = $scope;

        console.log('hi')
});