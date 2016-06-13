'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', 'StudyListService', 'EndpointService', '$rootScope',
    function ($scope, StudyListService, EndpointService, $rootScope) {

      $rootScope.publicStudies = [];
      $rootScope.privateStudies = [];

      $scope.searchTerm = '';
      $scope.searchKeys = [];

      $scope.addSearchKey = function () {
        if ($scope.searchKeys.indexOf($scope.searchTerm) < 0 && $scope.searchTerm.trim() !== '') {
          $scope.searchKeys.push($scope.searchTerm);
          $scope.searchTerm = '';
        }
      };

      $scope.removeAllSearchKeys = function () {
        $scope.searchKeys = [];
      };

      /**
       * remove a search key
       * @param searchKey
         */
      $scope.removeSearchKey = function (searchKey) {
        var idx = $scope.searchKeys.indexOf(searchKey);
        if (idx > -1) {
          $scope.searchKeys.splice(idx, 1);
        }
      };

      /**
       * To load studies from available endpoints
       */
      $scope.loadStudies = function () {

        var _endpoints = EndpointService.getEndpoints(); // get available endpoints

        _.each(_endpoints, function (endpoint) {
          StudyListService.loadStudyList(endpoint).then(function (result) {
            $rootScope.publicStudies = StudyListService.getPublicStudies();
            $rootScope.privateStudies =  StudyListService.getPrivateStudies();
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
