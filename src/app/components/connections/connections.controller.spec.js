'use strict';

describe('ConnectionsCtrlTests', function() {
  beforeEach(module('transmartBaseUi'));

  var $controller, scope, rootScope;

  beforeEach(inject(function (_$controller_, _$rootScope_) {
        scope = _$rootScope_.$new();
        rootScope = _$rootScope_;

        $controller = _$controller_('ConnectionsCtrl', {
            $scope: scope,
            $rootScope: rootScope
          });

  }));

  beforeEach(function (){
    scope.formData.endpointForm = {};
    scope.formData.endpointForm.$setPristine = function (){};
  });

  describe('OnStartup', function() {
    it('is defined', function() {
      expect($controller).not.toEqual(undefined);
    });
  });

  describe('Form actions', function() {

    it('populates the form correctly', function() {
      scope.populateDefaultApi('foo', 'bar');

      expect(scope.formData.title).toEqual('foo');
      expect(scope.formData.url).toEqual('bar');
      expect(scope.formData.requestToken).toEqual('');
    });

    it('clears the form correctly', function() {
      scope.populateDefaultApi('foo', 'bar');
      scope.resetEndpointForm();

      expect(scope.formData.title).toEqual('');
      expect(scope.formData.url).toEqual('');
      expect(scope.formData.requestToken).toEqual('');
    });
  });
});
