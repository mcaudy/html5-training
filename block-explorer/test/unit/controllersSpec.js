'use strict';

/* jasmine specs for controllers go here */

describe('Data model service', function() {
  var $httpBackend;
  var dataModelService;

  beforeEach(module('blockExplorer'));

  beforeEach(inject(function(_$httpBackend_, _DataModel_) {
      $httpBackend = _$httpBackend_;
      dataModelService = _DataModel_;
    }));

  it('should initially have a page index of 0', function()  {
    expect(dataModelService.getCurrentPageIndex()).toEqual(0);
  });

  it('should initially have a blank page of block hashes', function() {
    expect(dataModelService.getCurrentPageHashes()).toEqual([]);
  });

  it('should initially be on the last page', function() {
    expect(dataModelService.isLastPage()).toBeTruthy();
  });

  it('should initially be empty', function()  {
    expect(dataModelService.isEmpty()).toBeTruthy();
  });

  it('should get block data from Bitcoin Explorer', inject(function($rootScope)  {
    var expectedHash = 'TestHash';
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/TestHash').
          respond({hash: expectedHash, ver: '1'});

    // The data model service returns a promise, which returns the block data once it is resolved
    var blockDataPromise = dataModelService.getBlockData(expectedHash);
    var resolvedData;
    blockDataPromise.then(function(data)  {
      resolvedData = data;
    });
    // Flush the http backend and ensure that promises are resolved
    $httpBackend.flush();
    $rootScope.$apply();
    
    expect(resolvedData.hash).toBe(expectedHash);
    expect(resolvedData.ver).toBe('1');
  }));

  var getLatestPage = function($rootScope)  {
    var expectedHash = 'TestHash';
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/q/latesthash').
          respond(expectedHash);

    // Get 10 linked blocks
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/testhash').
          respond({hash: expectedHash, prev_block: 'hash1'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash1').
          respond({hash: 'hash1', prev_block: 'hash2'}); 
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash2').
          respond({hash: 'hash2', prev_block: 'hash3'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash3').
          respond({hash: 'hash3', prev_block: 'hash4'}); 
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash4').
          respond({hash: 'hash4', prev_block: 'hash5'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash5').
          respond({hash: 'hash5', prev_block: 'hash6'}); 
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash6').
          respond({hash: 'hash6', prev_block: 'hash7'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash7').
          respond({hash: 'hash7', prev_block: 'hash8'});   
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash8').
          respond({hash: 'hash8', prev_block: 'hash9'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash9').
          respond({hash: 'hash9', prev_block: 'hash10'});

    dataModelService.loadLatestPageData();

    // Flush the http backend and ensure that promises are resolved
    $httpBackend.flush();
    $rootScope.$apply();
  }

  it('should load latest page data from Bitcoin Explorer', inject(function($rootScope)  {
    getLatestPage($rootScope);

    var currentPageHashes = dataModelService.getCurrentPageHashes();
    expect(currentPageHashes).toEqual(['TestHash', 'hash1', 'hash2', 'hash3', 'hash4', 'hash5', 'hash6', 'hash7', 'hash8', 'hash9']);
  }));

  var getSecondPage = function()  {
    // Use the last block on the starting page to find the start of the previous page
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash9').
          respond({hash: 'hash9', prev_block: 'hash10'});
    // Now get the previous page worth of blocks
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash10').
          respond({hash: 'hash10', prev_block: 'hash11'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash11').
          respond({hash: 'hash11', prev_block: 'hash12'}); 
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash12').
          respond({hash: 'hash12', prev_block: 'hash13'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash13').
          respond({hash: 'hash13', prev_block: 'hash14'}); 
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash14').
          respond({hash: 'hash14', prev_block: 'hash15'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash15').
          respond({hash: 'hash15', prev_block: 'hash16'}); 
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash16').
          respond({hash: 'hash16', prev_block: 'hash17'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash17').
          respond({hash: 'hash17', prev_block: 'hash18'});   
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash18').
          respond({hash: 'hash18', prev_block: 'hash19'});
    $httpBackend.expectGET('http://localhost:8000/bitCoinSite/rawblock/hash19').
          respond({hash: 'hash19', prev_block: 'hash20'});
  }

  it('should load the previous page-worth of blocks if we are on the first page', inject(function($rootScope) {
    getLatestPage($rootScope);
    getSecondPage($rootScope);

    dataModelService.getPreviousBlocksArray();

    // Flush the http backend and ensure that promises are resolved
    $httpBackend.flush();
    $rootScope.$apply();

    expect(dataModelService.getCurrentPageIndex()).toBe(0);
    expect(dataModelService.getCurrentPageHashes()).toEqual(['hash10', 'hash11', 'hash12', 'hash13', 'hash14', 'hash15', 'hash16', 'hash17', 'hash18', 'hash19']);
  }));

  it('should go back to the first page if we load the previous page then tell the service to go to the next one', inject(function($rootScope) {
    getLatestPage($rootScope);
    getSecondPage($rootScope);

    dataModelService.getPreviousBlocksArray();

    // Flush the http backend and ensure that promises are resolved
    $httpBackend.flush();
    $rootScope.$apply();

    expect(dataModelService.getCurrentPageIndex()).toBe(0);
    
    dataModelService.getNextBlocksArray();

    expect(dataModelService.getCurrentPageIndex()).toBe(1);
    expect(dataModelService.getCurrentPageHashes()).toEqual(['TestHash', 'hash1', 'hash2', 'hash3', 'hash4', 'hash5', 'hash6', 'hash7', 'hash8', 'hash9']);
  }));

  it('should do nothing if we are on the last page and we tell it to go to the next page', function() {
    expect(dataModelService.getCurrentPageIndex()).toBe(0);
    dataModelService.getNextBlocksArray();
    expect(dataModelService.getCurrentPageIndex()).toBe(0);
  });
});

describe('Block list controller', function()  {
  var scope;
  var ctrl;
  var expectedBlocksOnPage = ['234234', '546456456456'];
  var mockModel;

  beforeEach(module('blockExplorer', function() {
      mockModel = {
        getCurrentPageHashes: function() {
          return expectedBlocksOnPage;
        },
        isLastPage: function()  {
          return true;
        },
        getLatestHash: function() {
          return '00ff';
        },
        isEmpty: function() {
          return false;
        }
      };
      spyOn(mockModel, 'isEmpty').andCallThrough();
      spyOn(mockModel, 'getLatestHash').andCallThrough();
      spyOn(mockModel, 'getCurrentPageHashes').andCallThrough();
      spyOn(mockModel, 'isLastPage').andCallThrough();
    }));

  beforeEach(inject(function($rootScope, $controller)  {
      scope = $rootScope.$new();
      ctrl = $controller('BlockListController', {$scope: scope, DataModel: mockModel});
    }));

  it('should be defined', function()  {
    expect(ctrl).toBeDefined();
  });

  it('should get block hashes from data model', function()  {
    expect(scope.blocks).toEqual(expectedBlocksOnPage);
    expect(scope.isLastPage).toBeTruthy();
  });
});

describe('Block details controller', function() {
    var scope;
    var ctrl;
    var expectedHash = 'TestValue';
    var mockModel;
    var q;

    beforeEach(module('blockExplorer', function() {
      mockModel = {
        getBlockData: function() {
          var deferred = q.defer();
          var data = {hash: expectedHash,
                ver: '1',
                prev_block: 'ffff',
                mrkl_root: '00ff',
                tx: []
          };
          deferred.resolve(data);
          return deferred.promise;
        }
      };
      spyOn(mockModel, 'getBlockData').andCallThrough();
    }));

    beforeEach(inject(function($rootScope, $routeParams, $controller, $q)  {
      $routeParams.hash = expectedHash;
      scope = $rootScope.$new();
      q = $q;

      ctrl = $controller('BlockDetailsController', {$scope: scope, DataModel: mockModel});
    }));

    it('should be defined', function()  {
      scope.$apply();
      expect(ctrl).toBeDefined();
    });

    it('should display block detail', function()  {
      scope.$apply();
      expect(scope.block).toBeDefined();
      expect(scope.block.hash).toBe(expectedHash);
      expect(scope.block.ver).toBe('1');
      expect(scope.block.prev_block).toBe('ffff');
      expect(scope.block.mrkl_root).toBe('00ff');
    });
  });
