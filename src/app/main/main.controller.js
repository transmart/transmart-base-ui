'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', 'Restangular', 'ChartService', 'AlertService', function ($scope, Restangular, ChartService, AlertService) {

    $scope.dataLoading = false;

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    $scope.selectedStudy = {
      'obj': null,
      'title': '',
      'panel': {
        isDisplayed: false
      }
    };

    $scope.metadata = {
      Title: 'Node title',
      Organism: 'Homo sapiens',
      Description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris faucibus ut nisl quis ullamcorper. Quisque in orci vitae nibh rhoncus blandit. Integer tincidunt nunc sit amet magna faucibus, eget pellentesque libero finibus. Sed eu cursus risus, ac pretium felis. In non turpis eros. Nam nec tellus venenatis, consectetur dui a, posuere dui. In id pellentesque elit, ac mattis orci. Donec aliquam feugiat neque nec efficitur. Donec fermentum posuere diam, quis semper felis aliquam vel. Praesent sit amet dapibus tortor. Aliquam sed quam non augue imperdiet scelerisque. Vivamus pretium pretium eros. Nullam finibus accumsan tempor. Duis mollis, ex nec maximus bibendum.'
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

    $scope.closeConceptsPanel = function () {
      $scope.selectedStudy.panel.isDisplayed = false;
    };

    $scope.displayNodeSummaryStatistics = function (node) {
      $scope.selectednode = node;
      ChartService.getObservations(node).then(function (d) {
        // at first, get the observation data for the selected node
        $scope.$apply(function () {
          $scope.observations = d;
          return $scope.observations;
        });
      }, function (err) {
          AlertService.add('danger', err);
        }
      ).then(function () {
        // then generate charts out of it
        if (typeof $scope.observations !== 'undefined') {
          ChartService.generateCharts($scope.observations);
        }
      });

    };

  }]);
