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

  it('is defined', function() {
    expect($controller).not.toEqual(undefined);
  });

  it('has no studies loaded', function() {
    expect(scope.publicStudies.length).toEqual(0);
    expect(scope.privateStudies.length).toEqual(0);
  });

});
