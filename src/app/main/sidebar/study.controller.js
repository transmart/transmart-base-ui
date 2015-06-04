'use strict';

angular.module('transmartBaseUi')
  .controller('StudyCtrl',
  ['$scope', 'Restangular', function ($scope, Restangular) {
    //------------------------------------------------------------------------------------------------------------------
    // Scope
    //------------------------------------------------------------------------------------------------------------------

    $scope.tree = [{}];
    $scope.opened = false;
    $scope.treeLoading = false;
    $scope.treeConfig = {
      drag: false,
      collapsed: true
    };

    $scope.status = {
      isFirstOpen: false,
      isFirstDisabled: false,
      oneAtATime: true,
    };


    $scope.type = {
      fol: function(node){return node.type === 'FOLDER';},
      num: function(node){return node.type === 'NUMERICAL';},
      cat: function(node){return node.type === 'CATEGORICAL';},
      hid: function(node){return node.type === 'HIGH_DIMENSIONAL';}
    };

    $scope.getTree = function (study) {
      $scope.selectedStudy = study;
      if(!$scope.opened){
        $scope.treeLoading = true;
        $scope.tree = getSingleTree(study);
        $scope.opened = true;
      }
    };

    $scope.countChilds = function (node)
    {
      if (node.hasOwnProperty('nodes')) {
        node.nodes.forEach(function(child){
          countSubjects(child);
        });
      }
    };

    //------------------------------------------------------------------------------------------------------------------
    // DUMMY
    //------------------------------------------------------------------------------------------------------------------
    $scope.metadata = {
      Title: 'Study title',
      Organism: 'Homo sapiens',
      Description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris faucibus ut nisl quis ullamcorper. Quisque in orci vitae nibh rhoncus blandit. Integer tincidunt nunc sit amet magna faucibus, eget pellentesque libero finibus. Sed eu cursus risus, ac pretium felis. In non turpis eros. Nam nec tellus venenatis, consectetur dui a, posuere dui. In id pellentesque elit, ac mattis orci. Donec aliquam feugiat neque nec efficitur. Donec fermentum posuere diam, quis semper felis aliquam vel. Praesent sit amet dapibus tortor. Aliquam sed quam non augue imperdiet scelerisque. Vivamus pretium pretium eros. Nullam finibus accumsan tempor. Duis mollis, ex nec maximus bibendum.'
    };

    angular.element('html').on('click', function(e) {
      if (typeof angular.element(e.target).data('original-title') == 'undefined' &&
        !angular.element(e.target).parents().is('.popover.inner')) {
        $('.popover').hide();
      }
    });

    //------------------------------------------------------------------------------------------------------------------
    // Helper functions
    //------------------------------------------------------------------------------------------------------------------
    var countSubjects = function(node) {
      if(!node.hasOwnProperty('total')){
        var path = node.link.slice(1);
        Restangular.all(path + '/subjects').getList()
          .then(function (subjects) {
            node.total = subjects.length;

          }, function () {

          });
      }
    };

    var orderTreeNodes = function (tree) {
      // Order the nodes by type with folders first
      var folders = [];
      var numerical = [];
      var catego = [];
      var high = [];

      if(tree.hasOwnProperty('nodes')){
        tree.nodes.forEach(function (node){
          if(node.type === 'FOLDER') {folders.push(node);}
          if(node.type === 'NUMERICAL') {numerical.push(node);}
          if(node.type === 'CATEGORICAL') {catego.push(node);}
          if(node.type === 'HIGH_DIMENSIONAL') {high.push(node);}
        });
        tree.nodes = folders.concat(numerical).concat(catego).concat(high);

        // Traverse the tree
        tree.nodes.forEach(orderTreeNodes);
      }
    };

    var parseFolder = function (paths, tree){
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
    };

    var setType = function (tree) {
      if (!tree.hasOwnProperty('nodes')) {
        var t = ['NUMERICAL', 'CATEGORICAL', 'HIGH_DIMENSIONAL'];
        tree.type = t[Math.floor(Math.random() * t.length)];
      } else {
        tree.type = 'FOLDER';
        tree.nodes.forEach(function (node) {
          setType(node);
        });
      }
    };

    var getSingleTree = function(study) {

      var tree = {};

      study.getList('concepts').then(function (concepts) {
        var paths = concepts.map(function (obj) {
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
          parseFolder(paths[id], tree);
        }

        setType(tree);
        orderTreeNodes(tree);
        $scope.countChilds(tree.nodes[0]);

      }).then(function(){
        $scope.treeLoading = false;
      });

      return tree;
    };

  }]);
