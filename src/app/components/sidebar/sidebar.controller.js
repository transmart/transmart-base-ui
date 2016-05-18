'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', 'StudyListService', 'EndpointService', '$rootScope',
    function ($scope, StudyListService, EndpointService, $rootScope) {

      $rootScope.publicStudies = [];
      $rootScope.privateStudies = [];

      $scope.searchTerm =   '';

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

    }]);
