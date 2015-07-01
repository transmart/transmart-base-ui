'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', '$window', 'Restangular', 'EndpointService', 'AlertService',
    function ($scope, $window, Restangular, EndpointService, AlertService) {
    //------------------------------------------------------------------------------------------------------------------
    // Scope
    //------------------------------------------------------------------------------------------------------------------

    $scope.endpoints = [];
    $scope.formData = {};

    $scope.endpointTabOpen = false;

    $scope.publicStudies = [];
    $scope.privateStudies = [];

    $scope.clearSavedEndpoints = function () {
      EndpointService.clearStoredEnpoints();
      $scope.endpoints = EndpointService.getEndpoints();
      loadStudies();
    };

    $scope.addResource = function() {
      var formData = $scope.formData;
      if (formData.requestToken) {
        EndpointService.addOAuthEndpoint(formData.title, formData.url, formData.requestToken)
          .then(function() {
            resetEndpointForm();
            _loadStudies();
          });
      }
      else {
        EndpointService.addEndpoint(formData.title, formData.url);
        resetEndpointForm();
        _loadStudies();
      }
      $scope.endpointTabOpen = false;
    };

    $scope.navigateToAuthorizationPage = function() {
      var url = $scope.formData.url;

      // Cut off any '/'
      if (url.substring(url.length-1, url.length) === '/') {
        url = url.substring(0, url.length-1);
      }

      var authorizationUrl = url +
        '/oauth/authorize?response_type=code&client_id=api-client&client_secret=api-client&redirect_uri=' +
        url + '/oauth/verify';

      $window.open(authorizationUrl, '_blank');
    };


    //------------------------------------------------------------------------------------------------------------------
    // Helper functions
    //------------------------------------------------------------------------------------------------------------------
    var _loadStudies = function () {
      var endpoints = EndpointService.getEndpoints();
      $scope.endpoints = endpoints;
      $scope.publicStudies = [];
      $scope.privateStudies = [];

      // Load studies for each endpoint
      endpoints.forEach(function(endpoint) {
        endpoint.restangular.all('studies').getList()
          .then(function (studies) {
            // alert user that it successfully connects to the rest-api
            AlertService.add('success', 'Loaded studies from: ' + endpoint.url, 3000);
            endpoint.status = 'success';
            $scope.studies = studies;

            // Checking if studies are public or private
            $scope.studies.forEach(function(study){
              study.endpoint = endpoint; // Keep reference to endpoint

              if (study._embedded.ontologyTerm.fullName.split('\\')[1] ===
                'Public Studies') {
                $scope.publicStudies.push(study);
              } else {
                $scope.privateStudies.push(study);
              }

            });
          }, function () {
            AlertService.add('danger', 'Could not load studies from API: ' +
              endpoint.url, 3000);
              });
            endpoint.status = 'error';
          });
     };

    $scope.populateDefaultApi = function(name, link) {
      $scope.formData.title = name;
      $scope.formData.url = link;
      $scope.formData.requestToken = '';
    };

    function resetEndpointForm() {
      var formData = $scope.formData;
      formData.title = '';
      formData.url = '';
      formData.requestToken = '';
      formData.endpointForm.$setPristine();
    }

<<<<<<< HEAD
    loadStudies();
=======
      _loadStudies();
>>>>>>> dev

  }]);
