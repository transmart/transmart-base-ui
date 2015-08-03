'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', 'StudyListService', function ($scope, StudyListService) {

      $scope.publicStudies = StudyListService.getPublicStudies();
      $scope.privateStudies =  StudyListService.getPrivateStudies();

      $scope.searchTerm =   '';

      $scope.loadStudies = function () {
        StudyListService.loadStudies().then(function () {
          $scope.publicStudies = StudyListService.getPublicStudies();
          $scope.privateStudies =  StudyListService.getPrivateStudies();
        });
      };

    }]);
