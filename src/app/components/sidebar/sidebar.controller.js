'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', 'StudyListService', function ($scope, StudyListService) {

      $scope.publicStudies = StudyListService.public;
      $scope.privateStudies =  StudyListService.private;

      $scope.searchTerm = '';

      var _loadStudies = function () {
        StudyListService.loadStudies().then(function () {
          $scope.publicStudies = StudyListService.public;
          $scope.privateStudies =  StudyListService.private;
        });
      };

      _loadStudies();

    }]);
