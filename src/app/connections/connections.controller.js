'use strict';

angular.module('transmartBaseUi')
  .controller('ConnectionsCtrl', ['$scope', '$location', 'EndpointService', 'StudyListService',
    function ($scope, $location, EndpointService, StudyListService) {

      $scope.formData = {};

      $scope.endpoints = EndpointService.getEndpoints();

      $scope.connections = [
        {label: 'transmart-gb', url: 'http://transmart-gb.thehyve.net/transmart', isOAuth:  true},
        {label: 'localhost', url: 'http://localhost:8080/transmart-rest-api', isOAuth:  false},
        {label: 'local iMAC', url: 'http://10.8.10.198:8080/transmart-rest-api', isOAuth: false} // local dev
      ];

      $scope.selectedConnection = '';

      /**
       * Empty endpoints
       */
      $scope.clearSavedEndpoints = function () {
        EndpointService.clearStoredEnpoints();
        $scope.endpoints = EndpointService.getEndpoints();
        StudyListService.loadStudies();
      };

      /**
       * Navigate to authorization page
       */
      $scope.navigateToAuthorizationPage = function () {
        EndpointService.navigateToAuthorizationPage($scope.formData.url);
      };

      /**
       * Add restful endpoint
       */
      $scope.addResource = function () {

        var _resetEndpointForm = function () {
          var formData = $scope.formData;
          formData.title = '';
          formData.url = '';
          formData.requestToken = '';
        };

        var formData = $scope.formData;

        if (formData.requestToken) {
          EndpointService.addOAuthEndpoint(formData.title, formData.url, formData.requestToken)
            .then(function (d) {
              $scope.endpoints = EndpointService.getEndpoints();
              _resetEndpointForm();
              StudyListService.loadStudies();
            }, function(err) {
              // TODO Error handling
              console.error('Error', err);
            });
        }
        else {
          EndpointService.addEndpoint(formData.title, formData.url);
          $scope.endpoints = EndpointService.getEndpoints();
          _resetEndpointForm();
          StudyListService.loadStudies();
        }
        $scope.endpointTabOpen = false;
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
       * @param e
       */
      $scope.removeEndpoint = function (e) {
        EndpointService.remove(e);
        StudyListService.loadStudies();
      };

      $scope.getStatusIcon = function (endpoint) {
        var glyphicon = 'glyphicon glyphicon-ban-circle'
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
