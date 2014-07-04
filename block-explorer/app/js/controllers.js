'use strict';

// Data object
function BlockData(name, hash, version, previousBlock, merkleRoot, time, nonce)	{
	this.name = name;
	this.hash = hash;
	this.version = version;
	this.previousBlock = previousBlock;
	this.merkleRoot = merkleRoot;
	this.time = time;
	this.nonce = nonce;
};

// Create our temporary backing data model
var dataModel = {};
dataModel['Block 1'] = new BlockData('Block 1', '00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d', '1', 'TODO', 'TODO', 'TODO', 'TODO');
dataModel['Block 2'] = new BlockData('Block 2', '00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d', '2', 'TODO', 'TODO', 'TODO', 'TODO');
dataModel['Block 3'] = new BlockData('Block 3', '00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d', '4', 'TODO', 'TODO', 'TODO', 'TODO');

/* Controllers */

angular.module('blockExplorer.controllers', [])
  .controller('BlockListController', ['$scope', '$http', '$log', function($scope, $http, $log) {
  	$http.get('http://localhost:8000/bitCoinSite/q/latesthash').success(function(data)	{
      console.log('Data: ' + data);
  		$scope.latesthash = data;
  	});

  	// Put our blocks into an array to be displayed in our list
  	var blocksArray = [];
  	var index = 0;
  	for (var key in dataModel)	{
  		if (dataModel.hasOwnProperty(key))	{
  			blocksArray[index] = dataModel[key];
  		}
  		++index;
  	}
  	$scope.blocks = blocksArray;
  }])
  .controller('BlockDetailsController', ['$scope', '$routeParams', function($scope, $routeParams) {
  	// Using the name of the block as the key, get the block data from the backing data model
  	$scope.block = dataModel[$routeParams.name];
  }]);
