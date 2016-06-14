'use strict';

describe('SidebarCtrl', function() {

  beforeEach(module('transmartBaseUi'));

  var $controller, scope, rootScope, StudyListService;

  beforeEach(inject(function (_$controller_, _$rootScope_, _StudyListService_) {

        StudyListService = _StudyListService_;
        scope = _$rootScope_.$new();
        rootScope = _$rootScope_;
        $controller = _$controller_('SidebarCtrl', {
            $scope: scope,
            $rootScope: rootScope
          });
  }));

  it('is should be defined', function() {
    expect($controller).not.toEqual(undefined);
  });

  it('should start with no studies loaded', function() {
    expect(scope.publicStudies.length).toEqual(0);
    expect(scope.privateStudies.length).toEqual(0);
  });

  describe('addSearchKey', function () {

    it('should add search key into searchKeys list', function () {
      scope.searchTerm = 'a';
      scope.searchKeys = [];
      scope.addSearchKey();
      expect(scope.searchKeys.length).toEqual(1);
    });

    it('should not add search key into searchKeys list if search key is empty', function () {
      scope.searchTerm = '';
      scope.searchKeys = [];
      scope.addSearchKey();
      expect(scope.searchKeys.length).toEqual(0);
    });

    it('should not add search key into searchKeys list if search key already exists', function () {
      scope.searchTerm = 'a';
      scope.searchKeys = ['a'];
      scope.addSearchKey();
      expect(scope.searchKeys.length).toEqual(1);
    });

  });

  describe('removeAllSearchKeys', function () {

    it('should remove all search keys', function () {
      scope.searchKeys = ['a', 'b', 'c'];
      scope.removeAllSearchKeys();
      expect(scope.searchKeys.length).toEqual(0);
    });

  });

  describe('removeAllSearchKeys', function () {

    it('should remove all search keys', function () {
      scope.searchKeys = ['a', 'b', 'c'];
      scope.removeSearchKey('a');
      expect(scope.searchKeys.length).toEqual(2);
    });

  });


  });
