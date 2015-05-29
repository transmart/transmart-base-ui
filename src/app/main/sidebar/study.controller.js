'use strict';

angular.module('transmartBaseUi')
  .controller('StudyCtrl',
  ['$scope', 'Restangular', function ($scope, Restangular) {

    $scope.tree = [{}];

    $scope.orderTreeNodes = function (tree) {
      // Order the nodes by type with folders first
      var folders = [];
      var numerical = [];
      var catego = [];
      var high = [];

      if(tree.hasOwnProperty('nodes')){
        tree.nodes.forEach(function (node){
          if(node.type === 'FOLDER') folders.push(node);
          if(node.type === 'NUMERICAL') numerical.push(node);
          if(node.type === 'CATEGORICAL') catego.push(node);
          if(node.type === 'HIGH_DIMENSIONAL') high.push(node);
        });
        tree.nodes = folders.concat(numerical).concat(catego).concat(high);

        // Traverse the tree
        tree.nodes.forEach($scope.orderTreeNodes);
      }
    };

    $scope.getSingleTree = function(study) {
      var tree = {};

      var parseFolder = function (paths){
        var cur = tree,
          last = tree;
        var strPath = paths.path;
        var path = paths.full.split('\\').slice(1,-1);

        while(path.length){
          var elem = path.shift();
          if (!cur.hasOwnProperty('title')) {
            cur.title = elem;
            // TODO: determine type from API answer
            if(path.length){
              cur.nodes = new Array({});
              cur = cur.nodes[0];
            } else {
              cur.link = strPath;
            }
          } else {
            if (cur.title === elem) {
              if(!cur.hasOwnProperty('nodes') && path.length) {
                cur.nodes = new Array({});
              }
              last = cur;
              cur = cur.nodes[cur.nodes.length-1]; // cont. traverse
            } else {
              // create new leaf and then push it
              var newNode = {};
              newNode.title = elem;
              if (!path.length) {
                newNode.link = strPath;
              }
              last.nodes.push(newNode);
              cur = newNode; // get latest item in nodes
            }
          }
        }
      }; //end parseFolder

      study.getList('concepts').then(function(concepts) {
        var paths = concepts.map(function(obj){
          return {full: obj.fullName, path: obj._links.self.href};
        });

        paths = paths.sort(function (a, b) {
          if (a.full > b.full) {
            return 1;
          }
          if (a.full < b.full) {
            return -1;
          }
          return 0;
        });


        for (var id in paths) {
          parseFolder(paths[id]);
        }

        var setType = function (tree) {
          if (!tree.hasOwnProperty('nodes')){
            var t = ['NUMERICAL', 'CATEGORICAL', 'HIGH_DIMENSIONAL'];
            tree.type = t[Math.floor(Math.random()*t.length)];
          } else {
            tree.type = 'FOLDER';
            tree.nodes.forEach(function (node){
              setType(node);
            });
          }
        };


        setType(tree);
        $scope.orderTreeNodes(tree);
        $scope.countChilds(tree.nodes[0]);

      });

      return tree;
    };

    $scope.treeConfig = {
      drag: false,
      collapsed: true
    };

    $scope.type = {
      fol: function(node){return node.type === 'FOLDER';},
      num: function(node){return node.type === 'NUMERICAL';},
      cat: function(node){return node.type === 'CATEGORICAL';},
      hid: function(node){return node.type === 'HIGH_DIMENSIONAL';}
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
      return angular.element(document.getElementById('tree-root-public')).scope();
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
      $scope.tree = $scope.getSingleTree(study);
    };

    $scope.countSubjects = function(node) {
      if(!node.hasOwnProperty('total')){
        var path = node.link.slice(1);
        Restangular.all(path + '/subjects').getList()
          .then(function (subjects) {
            node.total = subjects.length;

          }, function () {

          });
      }
    };

    $scope.countChilds = function (node) {
      node.nodes.forEach(function(child){
        $scope.countSubjects(child);
      });
    };



  }]);
