'use strict';

angular.module('transmartBaseUi')
  .controller('NavbarCtrl', ['$scope', 'CohortSelectionService',
    function ($scope, CohortSelectionService) {

    $scope.date = new Date();

    $scope.navigations = [
      {
        label : 'Home',
        path : 'home',
        isActive : true
      },
      {
        label : 'Workspace',
        children : [
          {
            label : 'Open',
            path : 'workspace'
          },
          {
            label : 'Export To File',
            action : 'exportToFile'
          },
          {
            label : 'Import from File',
            action : 'importToFile'
          }
        ],
        isActive : false
      },
      {
        label : 'Data Sources',
        path : 'connections',
        children : [],
        isActive : false
      }
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

     $scope.exportToFile = function () {
       CohortSelectionService.exportToJSONFile();
     };



  }]);
