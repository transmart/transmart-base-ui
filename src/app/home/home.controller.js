'use strict';

angular.module('transmartBaseUi')
  .controller('HomeCtrl', ['$scope', 'StudyListService',   function ($scope, StudyListService) {


    $scope.tutorial = {
      openStep1: true,
      disableStep1: false,
      openStep2: false
    };


    var init = function () {
      if (StudyListService.getAll().length > 0) {
        $scope.tutorial.openStep1 = false;
        $scope.tutorial.disableStep1 = true;
        $scope.tutorial.openStep2 = true;
      }
    };

    init();

  }]);
