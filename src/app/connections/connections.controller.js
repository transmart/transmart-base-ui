'use strict';

angular.module('transmartBaseUi')
  .controller('ConnectionsCtrl', ['$scope', '$location', 'EndpointService', 'StudyListService', '$rootScope', 'AlertService',
    function ($scope, $location, EndpointService, StudyListService, $rootScope, AlertService) {

      // alerts
      $scope.close = AlertService.remove;
      $scope.alerts = AlertService.get();

      // form data obj
      $scope.formData = {};

      // get list of stored endpoints (if any)
      $scope.endpoints = EndpointService.getEndpoints();

      // Predefined endpoints
      $scope.connections = [
        {title: 'transmart-gb', url: 'http://transmart-gb.thehyve.net/transmart', isOAuth:  true}
      ];

      $scope.selectedConnection = {};

      /**
       * Empty endpoints
       */
      $scope.clearSavedEndpoints = function () {
        EndpointService.clearStoredEndpoints();
        $scope.endpoints = EndpointService.getEndpoints();
        $rootScope.publicStudies = StudyListService.getPublicStudies();
        $rootScope.privateStudies = StudyListService.getPrivateStudies();
      };

      /**
       * Navigate to authorization page
       */
      $scope.navigateToAuthorizationPage = function () {
        // check selected connection
        var isSelected = _.filter(EndpointService.getEndpoints(), {url:$scope.selectedConnection.url});

        if (isSelected.length > 0) {
          AlertService.add('warning', 'You are already connected to ' + $scope.selectedConnection.url);
          return false;
        }

        EndpointService.authorizeEndpoint($scope.selectedConnection);
      };

      /**
       * Populate selected endpoint
       */
      $scope.populateDefaultApi = function () {
        $scope.formData.title = $scope.selectedConnection.label;
        $scope.formData.url = $scope.selectedConnection.url;
        $scope.formData.requestToken = '';
      };

      /**
       * Remove an endpoint
       * @param endpoint
       */
      $scope.removeEndpoint = function (endpoint) {
        EndpointService.removeEndpoint(endpoint);

        // delete study that has associated endpoint
        StudyListService.removeStudiesByEndpoint(endpoint);
        $rootScope.publicStudies = StudyListService.getPublicStudies();
        $rootScope.privateStudies =  StudyListService.getPrivateStudies();
      };

      /**
       * Get status icon
       * @param endpoint
       * @returns {string}
         */
      $scope.getStatusIcon = function (endpoint) {
        var glyphicon = 'glyphicon glyphicon-ban-circle';
        if (endpoint.status === 'active') {
          glyphicon = 'glyphicon-ok text-success';
        } else if (endpoint.status === 'error') {
          glyphicon = 'glyphicon-warning-sign text-warning';
        } else if (endpoint.status === 'local') {
          glyphicon = 'glyphicon glyphicon-hdd text-success';
        }
        return glyphicon;
      };

}]);
