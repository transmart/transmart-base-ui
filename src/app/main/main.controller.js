'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', 'Restangular', 'ChartService', 'AlertService', 'DataService', function ($scope, Restangular, ChartService, AlertService, DataService) {

    $scope.dataLoading = false;

    var dcData = {};
    dcData.dim = {};
    dcData.gro = {}

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    $scope.metadata = {
      Title: 'Node title',
      Organism: 'Homo sapiens',
      Description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris faucibus ut nisl quis ullamcorper. Quisque in orci vitae nibh rhoncus blandit. Integer tincidunt nunc sit amet magna faucibus, eget pellentesque libero finibus. Sed eu cursus risus, ac pretium felis. In non turpis eros. Nam nec tellus venenatis, consectetur dui a, posuere dui. In id pellentesque elit, ac mattis orci. Donec aliquam feugiat neque nec efficitur. Donec fermentum posuere diam, quis semper felis aliquam vel. Praesent sit amet dapibus tortor. Aliquam sed quam non augue imperdiet scelerisque. Vivamus pretium pretium eros. Nullam finibus accumsan tempor. Duis mollis, ex nec maximus bibendum.'
    };

    $scope.selectedStudy = {};
    $scope.observations = [];

    $scope.displayStudySummaryStatistics = function (study) {

      var _setLoadingAnim = function (data, chart) {
        $scope.dataLoading = data;
        $scope.chartLoading = chart;
      };

      angular.element('#node-charts-container').empty();
      _setLoadingAnim(true, false);
      $scope.selectednode = study;
/**
      ChartService.getSubjects(study).then(function(d) {

        $scope.$apply(function () {
          $scope.observations = d.chartData;
          $scope.selectedStudy.subjects = d.subjects;
          $scope.selectedStudy.title = study.id;

          //console.log($scope.selectedStudy.subjects);

          $scope.displayedCollection = [].concat($scope.selectedStudy.subjects);
          _setLoadingAnim(false, true);

        });
        return $scope.observations;

      }, function (err) {
        AlertService.add("danger", err, 10000);
      }).then (function (observations) {
        //console.log(observations);
        // then generate charts out of it
        if (typeof observations !== 'undefined') {
          ChartService.generateCharts(observations).then(function (charts) {
            ChartService.renderAll(charts);
          });
        }
      }).then (function () {
        _setLoadingAnim(false, false);
      });**/
    };

    $scope.displayNodeSummaryStatistics = function (node) {

      $scope.selectedNode = node;
      $scope.selectedStudy.title = "Tilte";

      var _setLoadingAnim = function (data, chart) {
        $scope.dataLoading = data;
        $scope.chartLoading = chart;
      };

      for(var i =0; i < 10; i++){
        angular.element('#chart_'+i).empty();
      }


      _setLoadingAnim(true, false);
      $scope.selectednode = node;

      DataService.getObservations(node).then(function(d){


          $scope.observations = d;
          $scope.labels3 = DataService.getLabels();

          _setLoadingAnim(false, true);



        //

        //dcData.data = crossfilter(d);
        /**
        dcData.dim.sex = dcData.data.dimension(function(d) {return d.sex;});
        dcData.gro.sex = dcData.dim.sex.group();
        dcData.dim.age = dcData.data.dimension(function(d) {return d.age;});
        dcData.gro.age = dcData.dim.age.group();
        dcData.dim.sexf = dcData.data.dimension(function(d) {return d.sex;});
        dcData.gro.sexf = dcData.dim.sex.group();

        dcData.dim.label = dcData.data.dimension(function(d) {return d.labels["\\Public Studies\\GSE8581\\Endpoints\\Diagnosis\\"];});
        dcData.gro.label = dcData.dim.label.group();

        dcData.dim.label1 = dcData.data.dimension(function(d) {return d.labels["\\Public Studies\\GSE8581\\Endpoints\\FEV1\\"];});
        dcData.gro.label1 = dcData.dim.label1.group(function(total) { return Math.floor(total); });


        tChart = dc.pieChart('#chart-sex');

        tChart
          .width(270)
          .height(200)
          .innerRadius(0)
          .dimension(dcData.dim.sex)
          .group(dcData.gro.sex)
          .renderLabel(false)
          .legend(dc.legend());

        _barChart = dc.barChart('#chart-age');
        _barChart
          .width(270)
          .height(200)
          .margins({top: 5, right: 5, bottom: 30, left: 25})
          .dimension(dcData.dim.age)
          .group(dcData.gro.age)
          .elasticY(true)
          .centerBar(true)
          .gap(1)
          .x(d3.scale.linear().domain([0, 100]))
          .renderHorizontalGridLines(true)
        ;
        _barChart.xAxis().tickFormat(
          function (v) { return v; });
        _barChart.yAxis().ticks(5);
        _barChart.xAxisLabel('Age');
        _barChart.yAxisLabel('# subjects');




        tChart3 = dc.pieChart('#chart-diag');


        tChart3
          .width(300)
          .height(300)
          .innerRadius(0)
          .dimension(dcData.dim.label)
          .group(dcData.gro.label)
          .renderLabel(false)
          .legend(dc.legend());

        _barChart2 = dc.barChart('#chart-fev');
        _barChart2
          .width(600)
          .height(200)
          .margins({top: 5, right: 5, bottom: 30, left: 25})
          .dimension(dcData.dim.label1)
          .group(dcData.gro.label1)
          .elasticY(true)
          .centerBar(true)
          .gap(1)
          .x(d3.scale.linear().domain([0, 10]))
          .renderHorizontalGridLines(true)
        ;
        _barChart2.xAxis().tickFormat(
          function (v) { return v; });
        _barChart2.yAxis().ticks(5);
        _barChart2.xAxisLabel('FEV');
        _barChart2.yAxisLabel('# subjects');

**/
      }).then(function(){
        //tChart.render();
        //_barChart.render();
        //tChart3.render();
        //_barChart2.render();

        // then generate charts out of it
        if (typeof $scope.observations !== 'undefined') {
          ChartService.populateCharts($scope.observations, dcData).then(function (c) {
            console.log(c);
            console.log("Charts");
            ChartService.renderAll(c);
          });
        }

      }).then (function () {
        _setLoadingAnim(false, false);
      });;


    };
  }]);
