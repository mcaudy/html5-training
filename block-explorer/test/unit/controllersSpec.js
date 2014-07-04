'use strict';

/* jasmine specs for controllers go here */

beforeEach(module('blockExplorer'));

describe('Block list controller', function()  {
  var scope;
  var ctrl;
  var $httpBackend;

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller)  {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('http://localhost:8000/bitCoinSite/q/latesthash').respond({name:'TestHash'});

      scope = $rootScope.$new();
      ctrl = $controller('BlockListController', {$scope: scope});
    }));

  it('should be defined', function()  {
    expect(ctrl).toBeDefined();
  });

  it('should get latest hash from Block Explorer', function() {
    $httpBackend.flush();
    expect(scope.latesthash.name).toBe('TestHash');
  });
});

describe('Block details controller', function() {
    var scope;
    var ctrl;

    beforeEach(inject(function($rootScope, $routeParams, $controller)  {
      $routeParams.name = 'Block 1';
      scope = $rootScope.$new();
      ctrl = $controller('BlockDetailsController', {$scope: scope});
    }));

    it('should be defined', function()  {
      expect(ctrl).toBeDefined();
    });

    it('should display block detail', function()  {
      expect(scope.block).toBeDefined();
      expect(scope.block.name).toBe('Block 1');
      expect(scope.block.version).toBe('1');
      expect(scope.block.previousBlock).toBe('TODO');
      expect(scope.block.merkleRoot).toBe('TODO');
    });
  });
