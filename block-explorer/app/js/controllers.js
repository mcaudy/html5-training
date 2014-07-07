'use strict';

var bitCoinUrl = 'http://localhost:8000/bitCoinSite';

/* Controllers */

var controllers = angular.module('blockExplorer.controllers', []);

controllers.service('DataModel', ['$rootScope', '$http', function($rootScope, $http) {
  var blockHashes = [];

  var loadBlockData = function(blockHash)  {
    return $http.get(bitCoinUrl + '/rawblock/' + blockHash);
  };

  var refreshData = function(startingHash)  {
    var blockDataPromise = loadBlockData(startingHash);
    blockDataPromise.success(function(blockData)  {
      blockHashes[blockHashes.length] = startingHash;

      // We keep loading blocks until we have a chain of 10
      if (blockHashes.length < 10)  {
        console.log('Block loaded. Loading next one...');
        refreshData(blockData.prev_block);
      }
      // At that point, let our app know that new data is available
      else  {
        console.log('Reached 10 blocks');
        console.log('Broadcasting data update');
        $rootScope.$broadcast('dataModel::dataUpdated', blockData);
      }
    });
  };

  // Kick things off by querying bitcoin explorer for the latest block available
  $http.get(bitCoinUrl + '/q/latesthash').success(function(hash)  {
        console.log(hash);
        //refreshData(hash.toLowerCase());

        // For testing, I've got a block hash here which I know contains data
        refreshData('00000000000000001be85a1d1ef9e276a3638d9d6d9d028c2b9d2b9b77b228ba');
      }
    );

  // We return a promise. The client should handle the success and error cases
  this.getBlockData = function(blockHash) {
    return loadBlockData(blockHash);
  };

  this.getBlocksArray = function()  {
    return blockHashes;
  };
}]);

controllers.controller('BlockListController', ['$scope', '$http', 'DataModel', function($scope, $http, DataModel) {

    console.log('Loading block list controller');

    $scope.$on('dataModel::dataUpdated', function(event, data) {
        console.log('Data model updated. Updating blocks array');
        $scope.blocks = DataModel.getBlocksArray();
    });

    $scope.blocks = DataModel.getBlocksArray();

    $scope.getPrevious = function() {
      console.log('Get previous');
    };

    $scope.getNext = function() {
      console.log('Get next');
    };
  }]);

controllers.controller('BlockDetailsController', ['$scope', '$routeParams', 'DataModel', function($scope, $routeParams, DataModel) {
  	var hash = $routeParams.hash;

    var updateBlockData = function(hash)  {
      // Using the name of the block as the key, get the block data from the backing data model
      var blockPromise = DataModel.getBlockData(hash);
      blockPromise.success(function(data) {
        $scope.block = data;
      });
    };
    updateBlockData(hash);

    $scope.$on('dataModel::dataUpdated', function(event, data) {
        console.log('Data model updated. Updating block data');
        updateBlockData(hash);
    });
  }]);
