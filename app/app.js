'use strict';

// Declare app level module which depends on views, and components
angular.module('crescendo-checkin', [
  'ngRoute',
  'crescendo-checkin.login',
  'crescendo-checkin.admin',
  'crescendo-checkin.primarily',
  'crescendo-checkin.secondary',
  'crescendo-checkin.zsuzsi',
  'crescendo-checkin.error',
  'cgNotify',
  'ngMaterial',
  'ngMessages'
]).constant('_', _).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/login'});
}]);
