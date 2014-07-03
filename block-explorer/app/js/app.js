'use strict';


// Declare app level module which depends on filters, and services
angular.module('blockExplorer', [
  'ngRoute',
  'blockExplorer.filters',
  'blockExplorer.services',
  'blockExplorer.directives',
  'blockExplorer.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/block-list', {templateUrl: 'partials/block-list.html', controller: 'MyCtrl1'});
  $routeProvider.when('/block-details', {templateUrl: 'partials/block-details.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/block-list'});
}]);
