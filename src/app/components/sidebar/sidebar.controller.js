'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', 'StudyListService', function ($scope, StudyListService) {

      $scope.publicStudies = StudyListService.getPublicStudies();
      $scope.privateStudies =  StudyListService.getPrivateStudies();


      $scope.searchTerm =   '';

      $scope.loadStudies = function () {
        console.log('hello ..')
        StudyListService.loadStudies().then(function () {
          $scope.publicStudies = StudyListService.getPublicStudies();
          $scope.privateStudies =  StudyListService.getPrivateStudies();
          $scope.$apply();
        });
      };


    }]);
