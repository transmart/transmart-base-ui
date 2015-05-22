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
      "id": "",
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
         * Build the study tree
         * @param studies
         * @returns {Array}
         */
        var buildTree = function (study) {

          var files={};
          $scope.data = [];

          var parseFolder = function (path){
            var cur = files;
            //console.log(path);
            path.split("\\").slice(1).forEach(function(elem){
                if (elem != "") {
                  if (!cur.hasOwnProperty("title")) {
                    cur["title"] = elem;
                    cur["nodes"] = new Array({});
                    cur = cur.nodes[0];
                  } else {
                    var arrIdx = 0;
                    // already has some nodes
                    if (cur["title"] == elem) {
                      cur = cur.nodes[arrIdx]; // cont. traverse
                    } else {
                      // create new leaf and then push it
                      var newNode = {};
                      newNode["title"] = elem;
                      newNode["nodes"] = new Array({});

                      cur.nodes.push(newNode);
                      cur = newNode; // get latest item in nodes
                    }
                  }
                }
            });
          }; //end parseFolder

          study.getList("concepts").then(function(concepts) {
            //console.log(concepts);
            for (var id in concepts) {
              if (!isNaN(id)) {
               // console.log(concepts[id]);
                parseFolder(concepts[id].fullName);
              }
            }
          });

          $scope.data.push(files);

        }; //end of build tree

        // alert user that it successfully connects to the rest-api
        $scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});

        //buildTree(studies[0]);

        studies.forEach(function (study) {
          //console.log(study);
          buildTree(study);
        });


        //for (var i=0; i<studies.length; i++) {
        //  buildTree(studies[i]);
        //}

        $scope.studies = studies;

      }, function (err) {
        // alert user that system cannot talk to the rest-api
        $scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
        console.error(err);
      });

  }]);
