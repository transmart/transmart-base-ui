'use strict';

angular.module('transmartBaseUi')
  .controller('ConnectionsCtrl', ['$scope', '$location', 'EndpointService',
    function ($scope, $location, EndpointService) {

      $scope.formData = {};

      $scope.endpoints = EndpointService.getEndpoints();

      $scope.connections = [
        {label: 'transmart-gb', url: 'http://transmart-gb.thehyve.net/transmart'},
        {label: 'localhost', url: 'http://localhost:8080/transmart-rest-api'}
      ];
      $scope.selectedConnection = '';

      /**
       * Empty endpoints
       */
      $scope.clearSavedEndpoints = function () {
        EndpointService.clearStoredEnpoints();
        $scope.endpoints = EndpointService.getEndpoints();
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
            }, function(err) {
              // TODO Error handling
            });
        }
        else {
          EndpointService.addEndpoint(formData.title, formData.url);
          _resetEndpointForm();
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
      };

}]);
