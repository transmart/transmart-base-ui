'use strict';

angular.module('transmartBaseUi')
  .controller('StudyCtrl',
  ['$scope', function ($scope) {
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

    $scope.divWidth = 100;

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

    /**
     * When a study is selected, get the tree
     * @param study
     */
    $scope.getTree = function (study) {
      $scope.selectedStudy = study;
      if(!$scope.opened){
        $scope.tree = _getSingleTree(study);
        $scope.opened = true;
      }
    };

    /**
     * When a node is clicked, get children of the children
     * @param node
     */
    $scope.populateChilds = function (node) {
      node.nodes.forEach(function(child){
        _getNodeChildren(child, false, '');
      })
    };

    //------------------------------------------------------------------------------------------------------------------
    // Helper functions
    //------------------------------------------------------------------------------------------------------------------

    //TODO: Adjust to node depth
    $scope.$watch(function() {
      $scope.divWidth = (angular.element(document.getElementById('sidebardiv')).width()-85)/10;
    });

    // Hide popover on click outside
    angular.element('html').on('click', function(e) {
      if(!angular.element(e.target).parents().is('.popover.inner')) {
        angular.element('.popover').hide();
      }
    });

    /**
     * Counts the subjects for a node
     * @param node
     * @private
     */
    var _countSubjects = function(node) {
      if(!node.hasOwnProperty('total')){
        node.restObj.one('subjects').get().then(function(subjects){
          node.total = subjects._embedded.subjects.length;
        });
      }
    };

    /**
     * Populates 2 levels of children for the node
     * @param node
     * @param end IF TRUE runs only for one level
     * @param prefix
     * @private
     */
    var _getNodeChildren = function(node, end, prefix){
      prefix = prefix || '';
      var children = node.restObj._links.children;

      if(!node.loaded){

        $scope.treeLoading = true;
        _countSubjects(node);

        if(children){
          children.forEach(function(child){
            var newNode = {
              'title': child.title,
              'nodes': [],
              'type': 'NUMERICAL',
              'loaded': false
            };

            node.restObj.one(prefix + child.title).get().then(function(childObj){
              newNode.restObj = childObj;
              if(childObj._links.children) newNode.type = 'FOLDER';
              node.nodes.push(newNode);
              if(!end) _getNodeChildren(newNode, true);
              else $scope.treeLoading = false;
            });
          });
        } else {
          $scope.treeLoading = false;
        }
      }

      if(!end) node.loaded = true;
    };

    /**
     * Populates the first 2 levels of a study tree
     * @param study
     * @returns {{title: string, nodes: Array, restObj: *, loaded: boolean}}
     * @private
     */
    var _getSingleTree = function(study) {
      study._links.children = study._embedded.ontologyTerm._links.children;
      var tree = {
        'title': 'ROOT',
        'nodes': [],
        'restObj': study,
        'loaded': false
      };
      _getNodeChildren(tree, false, 'concepts/');
      return tree;
    };

  }]);

/**



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
 **/
