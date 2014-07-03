'use strict';

/* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

describe('my app', function() {

  browser.get('index.html');

  it('should automatically redirect to /block-list when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/block-list");
  });


  describe('block-list', function() {

    beforeEach(function() {
      browser.get('index.html#/block-list');
    });


    it('should render block-list when user navigates to /block-list', function() {
      expect(element.all(by.css('[ng-view] h1')).first().getText()).
        toMatch(/Block 1/);
    });

  });


  describe('block-detail', function() {

    beforeEach(function() {
      browser.get('index.html#/block-details');
    });


    it('should render block-details when user navigates to /block-details', function() {
      expect(element.all(by.css('[ng-view] h1')).first().getText()).
        toMatch(/Block 1/);
        expect(element.all(by.css('[ng-view] p')).first().getText()).toMatch(/Version: 1/);
    });

  });
});
