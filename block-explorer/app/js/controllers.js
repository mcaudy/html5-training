'use strict';

var bitCoinUrl = 'http://localhost:8000/bitCoinSite';

/* Controllers */

var controllers = angular.module('blockExplorer.controllers', []);

controllers.service('DataModel', ['$rootScope', '$http', function($rootScope, $http) {
  var data = {};

  // Given the hash of a block, get the raw data for it
    var loadBlockData = function(blockHash)  {
      $http.get(bitCoinUrl + '/rawblock/' + blockHash).success(function(blockData)  {
        data[blockHash] = blockData;

        // We keep loading blocks until we have a chain of 10
        if (Object.keys(data).length < 10)  {
          console.log('Block loaded. Loading next one...')
          loadBlockData(blockData.prev_block);
        }
        // At that point, let our app know that new data is available
        else  {
          console.log('Reached 10 blocks');
          console.log('Broadcasting data update');
          $rootScope.$broadcast('dataModel::dataUpdated', data);
        }
      });
    };

  // Kick things off by querying bitcoin explorer for the latest block available
  $http.get(bitCoinUrl + '/q/latesthash').success(function(hash)  {
        console.log(hash);
        loadBlockData(hash.toLowerCase());

        // For testing, I've got a block hash here which I know contains data
        //loadBlockData('00000000000000001be85a1d1ef9e276a3638d9d6d9d028c2b9d2b9b77b228ba');
      }
    );

  return data;
}]);

controllers.controller('BlockListController', ['$scope', '$http', 'DataModel', function($scope, $http, DataModel) {

    console.log('Loading block list controller');

    $scope.$on('dataModel::dataUpdated', function(event, data) {
        console.log('Data model updated. Updating blocks array');
        updateBlocksArray();
    });

    var updateBlocksArray = function()  {
      // Put our blocks into an array to be displayed in our list
      var blocksArray = [];
      var index = 0;
      for (var key in DataModel)  {
        if (DataModel.hasOwnProperty(key))  {
          blocksArray[index] = DataModel[key];
        }
        ++index;
      }
      $scope.blocks = blocksArray;
    };

    updateBlocksArray();

    // TODO: Paging functionality doesn't work yet, but I've added pages to ensure that next and previous controls are displayed. We can work out how to view them later
    $scope.pages = ['Previous', 'Current', 'Next'];
  }]);

controllers.controller('BlockDetailsController', ['$scope', '$routeParams', 'DataModel', function($scope, $routeParams, DataModel) {
  	var hash = $routeParams.hash;

    // Using the name of the block as the key, get the block data from the backing data model
  	$scope.block = DataModel[hash];

    $scope.$on('dataModel::dataUpdated', function(event, data) {
        console.log('Data model updated. Updating block data');
        $scope.block = DataModel[hash];
    });
  }]);
