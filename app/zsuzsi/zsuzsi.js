'use strict';

angular.module('crescendo-checkin.zsuzsi', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/zsuzsi', {
    templateUrl: 'zsuzsi/zsuzsi.html',
    controller: 'ZsuzsiController'
  });
}])

.controller('ZsuzsiController',
    function($scope, $location, connectionProvider, storageProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider) {
        var target = 'ZsuzsiController';

        var vm = $scope;

        console.log('ZsuzsiController')
});