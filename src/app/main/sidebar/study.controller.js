'use strict';

angular.module('transmartBaseUi')
  .controller('StudyCtrl',
  ['$scope', 'Restangular', 'dataService', function ($scope, Restangular, dataService) {

    $scope.tree = [{}];

    $scope.treeConfig = {
      drag: false
    };

    $scope.type = {
      fol: function(node){return node.type == "FOLDER"},
      num: function(node){return node.type == "NUMERICAL"},
      cat: function(node){return node.type == "CATEGORICAL"},
      hid: function(node){return node.type == "HIGH_DIMENSIONAL"},
    }

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

    $scope.countSubjects = function(node) {
      console.log(node);
      var path = node.link
      Restangular.all('node').getList()
        .then(function (studies) {


        }, function (err) {

        });
    }

  }]);
