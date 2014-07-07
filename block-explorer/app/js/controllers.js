'use strict';

var bitCoinUrl = 'http://localhost:8000/bitCoinSite';

/* Controllers */

var controllers = angular.module('blockExplorer.controllers', []);

controllers.service('DataModel', ['$rootScope', '$http', function($rootScope, $http) {
  var currentPageIndex = 0;
  var currentPageHashes = [];
  var blockHashes = [];

  var loadBlockData = function(blockHash)  {
    return $http.get(bitCoinUrl + '/rawblock/' + blockHash);
  };

  var loadPageData = function(startingHash, pageIndex)  {
    var blockDataPromise = loadBlockData(startingHash);
    blockDataPromise.success(function(blockData)  {
      currentPageHashes[currentPageHashes.length] = startingHash;

      // We keep loading blocks until we have a chain of 10
      if (currentPageHashes.length < 10)  {
        console.log('Block loaded. Loading next one...');
        loadPageData(blockData.prev_block, pageIndex);
      }
      // At that point, let our app know that new data is available
      else  {
        console.log('Reached 10 blocks');
        console.log('Broadcasting data update');
        blockHashes[pageIndex] = currentPageHashes;
        $rootScope.$broadcast('dataModel::dataUpdated');
      }
    });
  };

  // Kick things off by querying bitcoin explorer for the latest block available
  $http.get(bitCoinUrl + '/q/latesthash').success(function(hash)  {
        loadPageData(hash.toLowerCase());

        // For testing, I've got a block hash here which I know contains data
        //loadPageData('00000000000000001be85a1d1ef9e276a3638d9d6d9d028c2b9d2b9b77b228ba', currentPageIndex);
      }
    );

  this.getPreviousBlocksArray = function()  {
    if (currentPageIndex === 0) {
      // Get the hash of the block previous to the last one on this page
      var lastBlockPromise = loadBlockData(currentPageHashes[currentPageHashes.length - 1]);
      lastBlockPromise.success(function(blockData)  {
        var previousBlockHash = blockData.prev_block;

        currentPageHashes = [];

        // Add an empty page to the start of our data
        blockHashes.unshift([]);

        // Load in the previous page-worth of data
        loadPageData(previousBlockHash, 0);
      });
    }
    else  {
      --currentPageIndex;
      currentPageHashes = blockHashes[currentPageIndex];
      $rootScope.$broadcast('dataModel::dataUpdated');
    }
  };

  this.getNextBlocksArray = function() {
    if (currentPageIndex < blockHashes.length - 1)  {
      ++currentPageIndex;
      currentPageHashes = blockHashes[currentPageIndex];
      $rootScope.$broadcast('dataModel::dataUpdated');
    }
  };

  this.getCurrentPageIndex = function() {
    return currentPageIndex;
  };

  // We return a promise. The client should handle the success and error cases
  this.getBlockData = function(blockHash) {
    return loadBlockData(blockHash);
  };

  this.getCurrentPageHashes = function()  {
    return currentPageHashes;
  };

  this.isLastPage = function()  {
    return currentPageIndex === blockHashes.length - 1;
  };
}]);

controllers.controller('BlockListController', ['$scope', '$http', 'DataModel', function($scope, $http, DataModel) {

    console.log('Loading block list controller');

    $scope.$on('dataModel::dataUpdated', function(event) {
        console.log('Data model updated. Updating blocks array');
        $scope.blocks = DataModel.getCurrentPageHashes();
        $scope.isLastPage = DataModel.isLastPage();
    });

    $scope.blocks = DataModel.getCurrentPageHashes();
    $scope.isLastPage = DataModel.isLastPage();

    $scope.getPrevious = function() {
      DataModel.getPreviousBlocksArray();
    };

    $scope.getNext = function() {
      DataModel.getNextBlocksArray();
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

    $scope.$on('dataModel::dataUpdated', function(event) {
        console.log('Data model updated. Updating block data');
        updateBlockData(hash);
    });
  }]);
