'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', 'Restangular', function ($scope, Restangular) {

    $scope.alerts = [];

    $scope.selectedStudy = {
      "obj": null,
      "title": "",
      "panel": {
        isDisplayed: false
      }
    };

    Restangular.all('studies').getList()
      .then(function (studies) {
        $scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});
        $scope.studies = studies;
      }, function (err) {
        $scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
        console.error(err);
      });

    $scope.getStudyConcepts = function (studyId) {

      $scope.selectedStudy.obj = ($scope.studies.one(studyId).one('concepts').get()).$object;
      $scope.selectedStudy.title = studyId;
      $scope.selectedStudy.panel.isDisplayed = true;

    };

    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.closeConceptsPanel = function () {
      $scope.selectedStudy.panel.isDisplayed = false;
    };

  }]);
