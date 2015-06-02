'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', 'Restangular', 'ChartService', function ($scope, Restangular, ChartService) {

    $scope.dataLoading = false;

    $scope.alerts = [];

    $scope.selectedStudy = {
      'obj': null,
      'title': '',
      'panel': {
        isDisplayed: false
      }
    };

    $scope.observations = [];

    $scope.getStudyConcepts = function (studyLink, studyId) {

      var t = studyLink.substr(1);
      $scope.dataLoading = true;


      Restangular.one(t + '/subjects').get()
        .then(function (d) {

          $scope.selectedStudy.obj = d._embedded.subjects;
          $scope.displayedCollection = [].concat($scope.selectedStudy.obj);
          $scope.selectedStudy.title = studyId;
          $scope.selectedStudy.panel.isDisplayed = true;

          var genderPieChart = dc.pieChart('#gender-pie-chart');
          var racePieChart = dc.pieChart('#race-pie-chart');
          var numericAgeChart = dc.barChart('#numeric-age-chart');
          var maritalChart = dc.pieChart('#marital-pie-chart');

          var ndx = crossfilter($scope.selectedStudy.obj),
              sexDimension = ndx.dimension(function(d) {return d.sex;}),
              sexGroup = sexDimension.group(),
              raceDimension = ndx.dimension(function(d) {return d.race;}),
              raceGroup = raceDimension.group(),
              ageDimension = ndx.dimension(function(d) {return d.age;}),
              ageGroup = ageDimension.group(),
              maritalDimension = ndx.dimension(function(d) {return d.maritalStatus;}),
              maritalGroup = maritalDimension.group();

          genderPieChart
            .width(200)
            .height(200)
            .innerRadius(0)
            .dimension(sexDimension)
            .group(sexGroup);
            //.legend(dc.legend());

          racePieChart
            .width(200)
            .height(200)
            .innerRadius(10)
            .dimension(raceDimension)
            .group(raceGroup);
            //.legend(dc.legend());

          numericAgeChart
            .width(750)
            .height(200)
            .margins({top: 10, right: 20, bottom: 30, left: 40})
            .dimension(ageDimension)
            .group(ageGroup)
            .elasticY(true)
            .centerBar(true)
            .gap(0)
            .x(d3.scale.linear().domain([0, 100]))
            .renderHorizontalGridLines(true)
            .filterPrinter(function (filters) {
              var filter = filters[0], s = '';
              s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
              return s;
            })
          ;
          numericAgeChart.xAxis().tickFormat(
            function (v) { return v + ' y/o'; });
          numericAgeChart.yAxis().ticks(5);
          numericAgeChart.xAxisLabel('Age');
          numericAgeChart.yAxisLabel('# of subjects');
          numericAgeChart.xAxisPadding(100);

          maritalChart
            .width(200)
            .height(200)
            .innerRadius(10)
            .dimension(maritalDimension)
            .group(maritalGroup);
          //.legend(dc.legend());

          dc.renderAll();

          $scope.dataLoading = false;
        });
    };

    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.closeConceptsPanel = function () {
      $scope.selectedStudy.panel.isDisplayed = false;
    };

    $scope.displayNodeSummaryStatistics = function (node) {
      ChartService.getObservations(node).then(function (d) {
        // at first, get the observation data for the selected node
        $scope.$apply(function () {
          $scope.observations = d;
          return $scope.observations;
        });
      }, function (err) {
          $scope.alerts.pop();
          $scope.alerts.push({type: 'danger', msg: err});
        }
      ).then(function () {
        // then generate charts out of it
        if (typeof $scope.observations !== 'undefined') {
          ChartService.generateCharts($scope.observations);
        }
      });

    };

  }]);
