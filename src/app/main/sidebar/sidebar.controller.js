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
            var cur = files,
                last = files;
            path = path.split("\\").slice(1,-1);

            while(path.length){
              var elem = path.shift();
              if (!cur.hasOwnProperty("title")) {
                cur["title"] = elem;
                if(path.length){
                  cur["nodes"] = new Array({});
                  cur = cur.nodes[0];
                }
              } else {
                if (cur["title"] == elem) {
                  if(!cur.hasOwnProperty("nodes") && path.length) {
                    cur["nodes"] = new Array({});
                  }
                  last = cur;
                  cur = cur.nodes[cur.nodes.length-1]; // cont. traverse
                } else {
                    // create new leaf and then push it
                  var newNode = {};
                  newNode["title"] = elem;
                  last.nodes.push(newNode);
                  cur = newNode; // get latest item in nodes
                }
              }
            };
          }; //end parseFolder

          study.getList("concepts").then(function(concepts) {
            var paths = concepts.map(function(obj){
              return obj.fullName;
            })
            paths = paths.sort();
            console.log(paths);

            for (var id in paths) {
              if (!isNaN(id)) {
               // console.log(concepts[id]);
                parseFolder(paths[id]);
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
