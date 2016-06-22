'use strict';

angular.module('transmartBaseUi')
  .directive('studyAccordion', [ function() {
    return {
      restrict: 'E',
      scope: {
        studies: '=studies',
        title: '=title',
        studyShown: '='
      },
      templateUrl: 'app/components/study-accordion/study-accordion.tpl.html',
      controller : 'StudyAccordionCtrl as ctrl'
    };
  }])
  .controller('StudyAccordionCtrl', ['$scope', '$uibModal', 'UtilService', 'TreeNodeService',
    function ($scope, $uibModal, UtilService, TreeNodeService) {

      $scope.treeConfig = {
        drag: false,
        collapsed: true
      };

      $scope.isURL =  UtilService.isURL;

      $scope.status = {
        isFirstOpen: false,
        isFirstDisabled: false,
        oneAtATime: true
      };

      $scope.populateChilds = function (node) {
        return node.nodes.forEach(function(child){
          TreeNodeService.getNodeChildren(child, false, '');
        });
      };


      /**
       * When a study is selected, get the tree
       * @param study
       */
      $scope.getTree = function (study) {
        if (study.open === undefined || !study.open) {
          study.tree = TreeNodeService.getSingleTree(study);
          study.open = true;
        } else {
          study.open = false;
        }
        return study;
      };

      $scope.displayMetadata = function (node) {
        if (node) {
          $scope.metadataObj = {};
          if (node.hasOwnProperty('restObj')) {
            $scope.metadataObj.title = node.title;
            $scope.metadataObj.fullname = node.restObj.fullName;
            $scope.metadataObj.body = node.restObj.metadata;
          } else if (node.hasOwnProperty('_embedded')) {
            $scope.metadataObj.title = node._embedded.ontologyTerm.name;
            $scope.metadataObj.fullname = node._embedded.ontologyTerm.fullName;
            $scope.metadataObj.body = node._embedded.ontologyTerm.metadata;
          }
        }
      };

  }]);
