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
      ctrl = $controller('BlockListController', {$scope: scope, DataModel: {}});
    }));

  it('should be defined', function()  {
    expect(ctrl).toBeDefined();
  });
});

describe('Block details controller', function() {
    var scope;
    var ctrl;
    var expectedHash = 'TestValue';

    beforeEach(inject(function($rootScope, $routeParams, $controller)  {
      $routeParams.hash = expectedHash;
      scope = $rootScope.$new();
      ctrl = $controller('BlockDetailsController', {$scope: scope, DataModel: {
        'TestValue': 
          {hash: expectedHash,
            ver: '1',
            prev_block: 'ffff',
            mrkl_root: '00ff'}
        }
      });
    }));

    it('should be defined', function()  {
      expect(ctrl).toBeDefined();
    });

    it('should display block detail', function()  {
      expect(scope.block).toBeDefined();
      expect(scope.block.hash).toBe(expectedHash);
      expect(scope.block.ver).toBe('1');
      expect(scope.block.prev_block).toBe('ffff');
      expect(scope.block.mrkl_root).toBe('00ff');
    });
  });
