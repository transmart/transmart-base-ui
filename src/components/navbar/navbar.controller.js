'use strict';

angular.module('transmartBaseUi')
  .controller('NavbarCtrl', ['$scope', 'AuthenticationService', '$state', function ($scope, AuthenticationService, $state) {
    $scope.date = new Date();

    $scope.usermenus = [
      {"label" : "Account Details", "action" : "accountDetails"},
      {"label" : "Administrator Dashboard", "action" : "adminDashboard"},
      {"label" : "Logout", "action" : "logout"},
    ];

    $scope.status = {
      isopen: false
    };

    $scope.toggled = function(open) {

    };

    $scope.toggleDropdown = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };

    $scope.logout = function() {
      AuthenticationService.ClearCredentials();
      $state.go('login')
    }

  }]);
