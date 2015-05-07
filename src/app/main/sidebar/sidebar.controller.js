'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl',
  ['$scope', 'Restangular', function ($scope, Restangular) {

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

    // ************************************************************
    // TODO: DUMMY DATA, USE REAL CONCEPTS FOR EACH SELECTED STUDY
    // ************************************************************
    $scope.data = [{
      "id": 1,
      "title": "node1",
      "nodes": [
        {
          "id": 11,
          "title": "node1.1",
          "nodes": [
            {
              "id": 111,
              "title": "node1.1.1",
              "nodes": []
            }
          ]
        },
        {
          "id": 12,
          "title": "node1.2",
          "nodes": []
        }
      ]
    }, {
      "id": 2,
      "title": "node2",
      "nodes": [
        {
          "id": 21,
          "title": "node2.1",
          "nodes": []
        },
        {
          "id": 22,
          "title": "node2.2",
          "nodes": []
        }
      ]
    }, {
      "id": 3,
      "title": "node3",
      "nodes": [
        {
          "id": 31,
          "title": "node3.1",
          "nodes": []
        }
      ]
    }, {
      "id": 4,
      "title": "node4",
      "nodes": [
        {
          "id": 41,
          "title": "node4.1",
          "nodes": []
        }
      ]
    }];

    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };

    $scope.oneAtATime = true;

    Restangular.all('studies').getList()
      .then(function (studies) {

        /**
         *
         * @param idx
         * @param token
         * @param jsonTree
         * @returns {*}
         */
        var createNode = function (idx, study, jsonTree) {

          var aTreeNode = {
            id: idx,
            title : study.id,
            nodes: []
          };

          // build nodes
          study.getList("concepts").then(function(d) {

          });

          jsonTree.push(aTreeNode);

          return jsonTree;
        };

        /**
         * build the study tree
         * @param studies
         * @returns {Array}
         */
        var buildTree = function (studies) {
          var jsonTree = [];

          // build study root
          for (var i=0; i<studies.length; i++) {
            jsonTree = createNode(i, studies[i], jsonTree);
          }

          console.log(jsonTree);

          //for (var i=0; i<studies.length; i++) {
          //  studies[i].getList("concepts").then(function (d) {
          //
          //    console.log('=========================== debug \n');
          //    console.log(d);
          //    console.log(d[i]);
          //    console.log(d[i].fullName);
          //    console.log(d[i].name);
          //
          //    var token, concept_tokens = d[i].fullName.split("\\");
          //
          //    for (token in concept_tokens) {
          //      if (concept_tokens[token] === ""){
          //        continue;
          //      }
          //      if ($.inArray(concept_tokens[token], jsonTree) < 0) {
          //        jsonTree = createNode(concept_tokens[token], jsonTree);
          //      }
          //    }
          //  });
          //}
        };

        // alert user that it successfully connects to the rest-api
        $scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});

        buildTree(studies);

        $scope.studies = studies;

      }, function (err) {
        // alert user that system cannot talk to the rest-api
        $scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
        console.error(err);
      });

  }]);
