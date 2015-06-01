'use strict';

angular.module('transmartBaseUi')
  .controller('StudyCtrl',
  ['$scope', 'Restangular', 'dataService', function ($scope, Restangular, dataService) {

    $scope.tree = [{}];

    $scope.treeConfig = {
      drag: false
    };

    $scope.remove = function(scope) {
      scope.remove();
    };

    $scope.toggle = function(scope) {
      scope.toggle();
    };

    $scope.moveLastToTheBegginig = function () {
      var a = $scope.data.pop();
      $scope.data.splice(0,0, a);
    };

    $scope.newSubItem = function(scope) {
      var nodeData = scope.$modelValue;
      nodeData.nodes.push({
        id: nodeData.id * 10 + nodeData.nodes.length,
        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
        nodes: []
      });
    };

    var getRootNodesScope = function() {
      return angular.element(document.getElementById("tree-root")).scope();
    };

    $scope.collapseAll = function() {
      var scope = getRootNodesScope();
      scope.collapseAll();
    };

    $scope.expandAll = function() {
      var scope = getRootNodesScope();
      scope.expandAll();
    };

    $scope.status = {
      isFirstOpen: false,
      isFirstDisabled: false
    };

    $scope.oneAtATime = true;

    $scope.getTree = function (study) {
      $scope.tree = dataService.getSingleTree(study);
      console.log($scope.tree);

    };

  }]);
