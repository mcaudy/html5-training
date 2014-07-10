'use strict';

var bitCoinUrl = 'http://localhost:8000/bitCoinSite';

/* Controllers */

var controllers = angular.module('blockExplorer.controllers', []);

controllers.service('DataModel', ['$rootScope', '$http', '$q', function($rootScope, $http, $q) {
  var currentPageIndex = 0;
  var currentPageHashes = [];
  var blockHashes = [currentPageHashes];

  var loadBlockData = function(blockHash)  {
    return $http.get(bitCoinUrl + '/rawblock/' + blockHash);
  };

  var storeHashAndGetPreviousHash = function(httpResponse) {
    var blockData = httpResponse.data;
    var deferred = $q.defer();
    currentPageHashes[currentPageHashes.length] = blockData.hash;
    deferred.resolve(blockData.prev_block);
    return deferred.promise;
  };

  var loadPageData = function(startingHash, pageIndex)  {
    var promise = loadBlockData(startingHash).then(storeHashAndGetPreviousHash);
    for (var i = 0; i < 9; ++i) {
      promise = promise.then(loadBlockData).then(storeHashAndGetPreviousHash);
    }

    promise = promise.then(function() {
      blockHashes[pageIndex] = currentPageHashes;
      $rootScope.$broadcast('dataModel::dataUpdated');
    });
  };

  this.loadLatestPageData = function() {
    console.log('Loading latest data');
    // Kick things off by querying bitcoin explorer for the latest block available
    $http.get(bitCoinUrl + '/q/latesthash').success(function(hash)  {
        loadPageData(hash.toLowerCase());

        // For testing, I've got a block hash here which I know contains data
        //loadPageData('00000000000000001be85a1d1ef9e276a3638d9d6d9d028c2b9d2b9b77b228ba', currentPageIndex);
      }
    );
  };

  this.getPreviousBlocksArray = function()  {
    if (currentPageIndex === 0) {
      // Get the hash of the block previous to the last one on this page
      var lastBlockPromise = loadBlockData(currentPageHashes[currentPageHashes.length - 1]);
      lastBlockPromise.success(function(blockData)  {
        var previousBlockHash = blockData.prev_block;

        currentPageHashes = [];

        // Add an empty page to the start of our data
        blockHashes.unshift(currentPageHashes);

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
    return loadBlockData(blockHash).then(function(httpResponse)  {
      var blockData = httpResponse.data;
      var deferred = $q.defer();
      deferred.resolve(blockData);
      return deferred.promise;
    });
  };

  this.getCurrentPageHashes = function()  {
    return currentPageHashes;
  };

  this.isLastPage = function()  {
    return currentPageIndex === blockHashes.length - 1;
  };

  this.isEmpty = function() {
    return ((blockHashes.length === 0) || (blockHashes.length === 1 && currentPageHashes.length === 0));
  }
}]);

controllers.controller('BlockListController', ['$scope', '$http', 'DataModel', function($scope, $http, DataModel) {
    if (DataModel.isEmpty())  {
      DataModel.loadLatestPageData();
    }

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
      blockPromise.then(function(data) {
        console.log(data);
        $scope.block = data;
        visualiseTransactions();
      });
    };
    updateBlockData(hash);

    $scope.$on('dataModel::dataUpdated', function(event) {
        console.log('Data model updated. Updating block data');
        updateBlockData(hash);
    });

    var visualiseTransactions = function()  {
      // Put our array of transactions into a tree, where the root node has the same 'in' property as its children
      var treeData = {
        'in' : $scope.block.tx
      };

      // For now, I'm limiting the number of children displayed. Otherwise the tree gets too busy
      treeData['in'] = treeData['in'].slice(0, 50);

      var svgSize = 960;
      var treeSize = svgSize * 0.8;

      var tree = d3.layout.tree()
                  .sort(null)
                  .size([treeSize, treeSize])
                  .children(function(d) {
                    return (!d['in'] || d['in'].length === 0) ? null : d['in'];
                  });

      var nodes = tree.nodes(treeData);
      var links = tree.links(nodes);

      // Set zoom behaviour on the svg element. This also seems to enable dragging behaviour. Good times.
      var zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed);

      var svg = d3.select('svg');
      svg.style('background-color', 'white')
        .style("width", svgSize)
        .style('height', svgSize);
      svg.call(zoom);

      // Render the tree. We start zoomed out with the tree in the middle of the view. We then zoom in on it
      var layoutRoot = svg.append("g")
        .attr("class", "container")
        .attr("transform", "translate(" + treeSize / 3 + "," + treeSize / 3 + ")scale(0.2,0.2)")
        .call(zoom);

      layoutRoot.transition()
          .duration(750)
          .attr("transform", function(d)  { return "translate(" + svgSize * 0.05 + "," + svgSize * 0.05 + ")scale(1,1)"; });

      function zoomed() {
        layoutRoot.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }

      // Links between nodes
      var link = d3.svg.diagonal()
         .projection(function(d) { return [d.y, d.x]; });

      var linkGroup = layoutRoot.selectAll("path.link")
         .data(links)
         .enter()
         .append("path")
         .attr("class", "link")
         .attr("d", link);

      // Nodes
      var nodeGroup = layoutRoot.selectAll("g.node")
        .data(nodes)
        .enter()
         .append("g")
         .attr("class", "node")
         .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      nodeGroup.append("circle")
         .attr("class", "node-dot")
         .attr("r", 2);

      // The first node is this block. We label it as such
      var firstNode = layoutRoot.select("g.node");
        firstNode.append("text")
              .text(function(d) { return 'This block'; } )
              .attr('dy', -10)
              .attr('dx', -30);
    };
  }]);
