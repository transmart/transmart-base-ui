'use strict';

angular.module('transmartBaseUi')
  .controller('NavbarCtrl', ['$scope', function ($scope) {
    $scope.date = new Date();

    $scope.navigations = [
      {
        label : 'Home',
        path : 'home',
        isActive : true
      },
      {
        label : 'Workspace',
        path : 'workspace',
        isActive : false
      },
      {
        label : 'Data Sources',
        path : 'connections',
        isActive : false
      }
    ];

    $scope.usermenus = [
      {'label' : 'Account Details', 'action' : 'accountDetails'},
      {'label' : 'Administrator Dashboard', 'action' : 'adminDashboard'},
      {'label' : 'Logout', 'action' : 'logout'}
    ];

    $scope.setActiveNavItem = function (idx) {
      for (var i = 0; i<$scope.navigations.length; i++) {
        $scope.navigations[i].isActive = false;
      }
      $scope.navigations[idx].isActive = true;
    };

    $scope.toggleDropdown = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };


  }]);
