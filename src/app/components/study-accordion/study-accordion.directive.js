'use strict';

angular.module('transmartBaseUi')
  .directive('studyAccordion', [function () {
    return {
      restrict: 'E',
      scope: {
        studies: '=studies',
        title: '=title',
        studyShown: '='
      },
      templateUrl: 'app/components/study-accordion/study-accordion.tpl.html',
      controller: 'StudyAccordionCtrl as ctrl'
    };
  }])
  .controller('StudyAccordionCtrl', ['$scope', '$uibModal', 'UtilService', 'TreeNodeService', '$log',
    function ($scope, $uibModal, UtilService, TreeNodeService, $log) {

      $scope.treeConfig = {
        drag: false,
        collapsed: true
      };

      $scope.isURL = UtilService.isURL;

      $scope.status = {
        isFirstOpen: false,
        isFirstDisabled: false,
        oneAtATime: true
      };

      $scope.populateChildren = function (node) {

        // first check if node has restangular object or not
        // if not it means it's root node a.k.a study

        if (!node.hasOwnProperty('restObj')) {
          node = TreeNodeService.setRootNodeAttributes(node);
          return TreeNodeService.getNodeChildren(node, 'concepts/').then(function (result) {
            node.isLoading = false;
          });
        }

        node.isLoading = true;
        TreeNodeService.getNodeChildren(node).then(function (result) {
          console.log('after getNodeChildren')
          node.isLoading = false;
        });

      };

      $scope.displayMetadata = function (node) {
        if (node) {
          $scope.clearMetadata();
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

      $scope.clearMetadata = function () {
        $scope.metadataObj = {};
        var query = document.getElementsByClassName("popover ng-isolate-scope right fade in");
        var elms = angular.element(query);
        elms.remove();
      }

    }]);
