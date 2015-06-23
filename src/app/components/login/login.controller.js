'use strict';

angular.module('transmartBaseUi')
  .controller('LoginCtrl', ['$scope', '$state', '$location', 'AuthenticationService', 'AlertService',
    function ($scope, $state, $location, AuthenticationService, AlertService) {

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    // reset login status
    AuthenticationService.ClearCredentials();

    $scope.login = function () {
      $scope.dataLoading = true;
      AuthenticationService.Login($scope.username, $scope.password, function(response) {
        if(response.success) {
          AlertService.reset();
          AuthenticationService.SetCredentials($scope.username, $scope.password);
          $location.path('/');
        } else {
          AlertService.add('danger', 'Invalid login credentials.');
          $scope.error = response.message;
          $scope.dataLoading = false;
        }
      });
    };

  }]);
