'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', function ($scope) {

    $scope.dataLoading = false;

    $scope.alerts = [];

    $scope.selectedStudy = {
      "obj": null,
      "title": "",
      "panel": {
        isDisplayed: false
      }
    };

    $scope.getStudyConcepts = function (study) {
      var studyLink = study._links.self.href;
      var studyId = study._embedded.ontologyTerm.name;
      
      var t = studyLink.substr(1);
      $scope.dataLoading = true;

      study.endpoint.restangular.one(t + '/concepts/ROOT/observations').get()
        .then(function (d) {

          $scope.selectedStudy.obj = d._embedded['observations'];
          $scope.displayedCollection = [].concat($scope.selectedStudy.obj);
          $scope.selectedStudy.title = studyId;
          $scope.selectedStudy.panel.isDisplayed = true;

          var genderPieChart = dc.pieChart("#gender-pie-chart");

          var ndx = crossfilter($scope.selectedStudy.obj),
              sexDimension = ndx.dimension(function(d) {return d._embedded.subject.sex;}),
              sexGroup = sexDimension.group();

          genderPieChart
            .width(400)
            .height(200)
            .innerRadius(0)
            .dimension(sexDimension)
            .group(sexGroup)
            .legend(dc.legend());

          genderPieChart.render();

          $scope.dataLoading = false;
        });

    };

    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.closeConceptsPanel = function () {
      $scope.selectedStudy.panel.isDisplayed = false;
    };

  }]);
