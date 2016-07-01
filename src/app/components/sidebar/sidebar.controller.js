'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', 'StudyListService', 'EndpointService',
    function ($scope, StudyListService, EndpointService) {

      $scope.publicStudies = [];
      $scope.privateStudies = [];

      $scope.searchTerm = '';
      // Default to false (OR)
      $scope.searchMode = false;
      $scope.operator = 'OR';
      $scope.searchKeys = [];

      $scope.$watch('searchMode', function(newVal){
        $scope.operator = newVal ? 'AND' : 'OR';
        StudyListService.showStudiesByKeys($scope.searchKeys, $scope.operator);
      });

      /**
       * Add search key, invoked when user press Enter key in search input box.
       */
      $scope.addSearchKey = function () {
        if ($scope.searchKeys.indexOf($scope.searchTerm) < 0 && $scope.searchTerm.trim() !== '') {
          $scope.searchKeys.push($scope.searchTerm);
          $scope.searchTerm = '';
          // search metadata
          StudyListService.showStudiesByKeys($scope.searchKeys, $scope.operator);
        }
      };

      /**
       * Clear all search keys
       */
      $scope.removeAllSearchKeys = function () {
        $scope.searchKeys = [];
        StudyListService.showAll();
      };

      /**
       * Remove a search key
       * @param searchKey
         */
      $scope.removeSearchKey = function (searchKey) {
        var idx = $scope.searchKeys.indexOf(searchKey);
        if (idx > -1) {
          $scope.searchKeys.splice(idx, 1);
        }
        // Re-display studies of remaining matched search keywords or show all studies when there's no search keys left
        $scope.searchKeys.length > 0 ?
          StudyListService.showStudiesByKeys($scope.searchKeys, $scope.operator) : StudyListService.showAll();
      };

      /**
       * Load studies from available endpoints
       */
      $scope.loadStudies = function () {

        var _endpoints = EndpointService.getEndpoints(); // get available endpoints

        _.each(_endpoints, function (endpoint) {
          StudyListService.loadStudyList(endpoint).then(function (result) {
            $scope.publicStudies = StudyListService.getPublicStudies();
            $scope.privateStudies =  StudyListService.getPrivateStudies();
          }, function () {
            EndpointService.invalidateEndpoint(endpoint);
          });
        });
      };

      $scope.loadStudies();


    }])
  .directive('buEnterKey', function () {
    return {
      restrict: 'A',
      link : function ($scope, $element, $attrs, ctrls) {
        $element.bind("keypress", function(event) {
          var keyCode = event.which || event.keyCode;
          if (keyCode === 13) {
            $scope.$apply(function() {
              $scope.$eval($attrs.buEnterKey, {$event: event});
            });
          }
        });
      }
    }
  });
