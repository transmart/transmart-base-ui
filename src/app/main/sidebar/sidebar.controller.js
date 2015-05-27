'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl',
  ['$scope', 'Restangular', 'dataService', function ($scope, Restangular, dataService) {

    $scope.studies = [];

    $scope.studies = dataService.studies.getStudies();

  }]);
