'use strict';

angular.module('transmartBaseUi')
  .controller('LoginCtrl', ['$scope', '$state', '$location', 'AuthenticationService', 'alertService',
    function ($scope, $state, $location, AuthenticationService, alertService) {

    $scope.close = alertService.remove;
    $scope.alerts = alertService.get();

    // reset login status
    AuthenticationService.ClearCredentials();

    $scope.login = function () {
      $scope.dataLoading = true;
      AuthenticationService.Login($scope.username, $scope.password, function(response) {
        if(response.success) {
          alertService.reset();
          AuthenticationService.SetCredentials($scope.username, $scope.password);
          $location.path('/');
        } else {
          alertService.add('danger', 'Invalid login credentials.');
          $scope.error = response.message;
          $scope.dataLoading = false;
        }
      });
    };

  }]);
