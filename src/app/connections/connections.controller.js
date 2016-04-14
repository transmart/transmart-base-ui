'use strict';

angular.module('transmartBaseUi')
  .controller('ConnectionsCtrl', ['$scope', '$location', 'EndpointService', 'StudyListService', '$rootScope',
    function ($scope, $location, EndpointService, StudyListService, $rootScope) {

      var accessToken = $location.hash(), newConnection, selectedConnection;

      var _resetEndpointForm = function () {
        $scope.formData.title = '';
        $scope.formData.url = '';
        $scope.formData.requestToken = '';
      };

      var _updateStudyContainer = function () {

        StudyListService.emptyAll();

        _.each($scope.endpoints, function (endpoint) {
          StudyListService.loadStudyList(endpoint).then(function (studies) {
            $rootScope.publicStudies = StudyListService.getPublicStudies();
            $rootScope.privateStudies =  StudyListService.getPrivateStudies();
          });
        });

        $scope.endpoints = EndpointService.getEndpoints();

        _resetEndpointForm();
      };

      $scope.formData = {};

      $scope.endpoints = EndpointService.getEndpoints();

      // Predefined endpoints
      $scope.connections = [
        {title: 'transmart-gb', url: 'http://transmart-gb.thehyve.net/transmart', isOAuth:  true},
        {title: 'iMac', url: 'http://10.8.10.249:8080/transmart', isOAuth:  true},
        {title: 'localhost', url: 'http://localhost:8080/transmart', isOAuth:  true}
      ];

      $scope.selectedConnection = {};


      // when URI contains oauth2 response need to be handled
      if (accessToken.length > 1) {
            newConnection = JSON.parse('{"' + decodeURI(accessToken.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
            selectedConnection = EndpointService.getSelectedEndpoint();
            angular.merge(newConnection, selectedConnection);
            EndpointService.saveAuthorizedEndpoint(newConnection);
            _updateStudyContainer();
            $scope.endpointTabOpen = false;
            $location.url($location.path()); // uri fragments
      }

      /**
       * Empty endpoints
       */
      $scope.clearSavedEndpoints = function () {
        EndpointService.clearStoredEnpoints();
        $scope.endpoints = EndpointService.getEndpoints();
        $rootScope.publicStudies = [];
        $rootScope.privateStudies = [];
      };

      /**
       * Navigate to authorization page
       */
      $scope.navigateToAuthorizationPage = function () {
        EndpointService.saveSelectedEndpoint($scope.selectedConnection);
        EndpointService.navigateToAuthorizationPage($scope.formData.url);
      };

      /**
       * Add restful endpoint
       */
      $scope.addResource = function () {

        if ($scope.formData.requestToken) {
          EndpointService.addOAuthEndpoint($scope.formData.title, $scope.formData.url, $scope.formData.requestToken)
            .then(function (d) {
              _updateStudyContainer();
            }, function(err) {
              // TODO Error handling
              console.error('Error', err);
              _updateStudyContainer();
            });
        } else {
          EndpointService.addEndpoint($scope.formData.title, $scope.formData.url);
          _updateStudyContainer();
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

        // delete study that has associated endpoint
        StudyListService.removeStudiesByEndpoint(e);
        $rootScope.publicStudies = StudyListService.getPublicStudies();
        $rootScope.privateStudies =  StudyListService.getPrivateStudies();
      };

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
