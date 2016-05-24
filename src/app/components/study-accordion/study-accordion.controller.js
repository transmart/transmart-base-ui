'use strict';
/* jshint undef: false */

angular.module('transmartBaseUi')
  .controller('StudyCtrl',
  ['$scope', '$uibModal','$location','$state', function ($scope, $uibModal, $location, $state) {

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

    $scope.callFailure = false;

    $scope.divWidth = 100;

    $scope.status = {
      isFirstOpen: false,
      isFirstDisabled: false,
      oneAtATime: true
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
        'loaded': false,
        'study': study
      };
      _getNodeChildren(tree, false, 'concepts/');
      return tree;
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
      } else {
        $scope.opened = false;
      }
    };

    /**
     * When a node is clicked, get children of the children
     * @param node
     */
    $scope.populateChilds = function (node) {
      node.nodes.forEach(function(child){
        _getNodeChildren(child, false, '');
      });
    };

    //------------------------------------------------------------------------------------------------------------------
    // Helper functions
    //--------------------------------------displayToolTip----------------------------------------------------------------------------

    /**
     * Counts the subjects for a node
     * @param node
     * @private
     */
    var _countSubjects = function(node) {
      if(!node.hasOwnProperty('restObj')){
        node.total = '-';
      }
      else if(!node.hasOwnProperty('total')){
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
      var children = node.restObj ? node.restObj._links.children : undefined;

      if(!node.loaded){

        $scope.treeLoading = true;
        _countSubjects(node);

        if(children){
          children.forEach(function(child){

            var newNode = {
              title: child.title,
              nodes: [],
              loaded: false,
              study: node.study
            };

            node.restObj.one(prefix + child.title).get().then(function(childObj){

              newNode.type = childObj.type ? childObj.type : 'UNDEF';
              newNode.restObj = childObj;

              if(newNode.type === 'CATEGORICAL_OPTION'){
                node.type = 'CATEGORICAL_CONTAINER';
              }

              node.nodes.push(newNode);

              if (!end) {
                _getNodeChildren(newNode, true);
              } else {
                $scope.treeLoading = false;
              }

            }, function(){
              newNode.type = 'FAILED_CALL';
              node.nodes.push(newNode);
              //$scope.callFailure = true;
              $scope.treeLoading = false;
              node.loaded = true;
            });
          });
        } else {
          $scope.treeLoading = false;
        }
      }

      if (!end) {
        node.loaded = true;
      }
    };

    $scope.displayToolTip = function (e, node) {
        e.stopPropagation(); // preventing selected accordion to expand.
        $scope.treeNode = node;
        if ($scope.treeNode.hasOwnProperty('_embedded')) {
          $scope.treeNode.isStudy = true;
        }
    };

    $scope.displayMetadata = function (node) {
        var _metadataObj = {};

        if (node.hasOwnProperty('restObj')) {
          _metadataObj.title = node.title;
          _metadataObj.fullname = node.restObj.fullName;
          _metadataObj.body = node.restObj.metadata;
        } else if (node.hasOwnProperty('_embedded')) {
          _metadataObj.title = node._embedded.ontologyTerm.name;
          _metadataObj.fullname = node._embedded.ontologyTerm.fullName;
          _metadataObj.body = node._embedded.ontologyTerm.metadata;
        }

        $uibModal.open({
          animation: false, // IMPORTANT: Cannot use animation in angular 1.4.x
          controller: 'MetadataCtrl',
          templateUrl: 'app/components/metadata/metadata.html',
          resolve: {
            metadata: function () {
              return _metadataObj;
            }
          }
        });
    };

    $scope.displaySummaryStatistics = function (node) {
      $state.go('workspace', {action : 'summaryStats', study : node.id}, {reload : true});
    };

  }]);
