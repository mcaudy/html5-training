'use strict';

/* jasmine specs for controllers go here */

beforeEach(module('blockExplorer'));

describe('controllers', function(){

  it('should define a block list controller', inject(function($controller) {
    //spec body
    var blockListController = $controller('BlockListController', { $scope: {} });
    expect(blockListController).toBeDefined();
  }));

  it('should define a block details controller', inject(function($controller) {
    //spec body
    var blockDetailsController = $controller('BlockDetailsController', { $scope: {}, $routeParams: {name: 'Block 1'} });
    expect(blockDetailsController).toBeDefined();
  }));
});

describe('Block details controller', function() {
    var scope;
    var ctrl;

    beforeEach(inject(function($rootScope, $routeParams, $controller)  {
      $routeParams.name = 'Block 1';
      scope = $rootScope.$new();
      ctrl = $controller('BlockDetailsController', {$scope: scope});
    }));

    it('should display block detail', function()  {
      expect(scope.block).toBeDefined();
      expect(scope.block.name).toBe('Block 1');
      expect(scope.block.version).toBe('1');
      expect(scope.block.previousBlock).toBe('TODO');
      expect(scope.block.merkleRoot).toBe('TODO');
    });
  });
