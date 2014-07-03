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
  $routeProvider.when('/block-list', {templateUrl: 'partials/block-list.html', controller: 'BlockListController'});
  $routeProvider.when('/block-list/:name', {templateUrl: 'partials/block-details.html', controller: 'BlockDetailsController'});
  $routeProvider.otherwise({redirectTo: '/block-list'});
}]);
