'use strict';

describe('ImportWorkspaceCtrl unit test', function() {

  beforeEach(module('transmartBaseUi'));

  var $controller, modalInstance =  { close: function() {}, dismiss: function() {} };

  beforeEach(inject(function(_$controller_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));


  describe('initial checks', function() {
    var $scope;

    beforeEach(inject(function(_$controller_, _ChartService_, _EndpointService_, _CohortSelectionService_){
      $scope = {
        content : {
          nodes : []
        }
      };
      var controller = $controller('ImportWorkspaceCtrl', {
        $scope: $scope,
        $uibModalInstance: modalInstance
      });
      spyOn(modalInstance, 'close');
      spyOn(modalInstance, 'dismiss');
    }));

    it ('should invoke modalInstance.close()', function () {
      $scope.ok();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it ('should invoke modalInstance.dismiss()', function () {
      $scope.cancel();
      expect(modalInstance.dismiss).toHaveBeenCalled();
    });
  });

});
