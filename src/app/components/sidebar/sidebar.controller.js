'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', '$window', 'Restangular', 'EndpointService', 'AlertService',
    function ($scope, $window, Restangular, EndpointService, AlertService) {
    //------------------------------------------------------------------------------------------------------------------
    // Scope
    //------------------------------------------------------------------------------------------------------------------

    $scope.endpoints = [];
    $scope.formData = {};

    $scope.publicStudies = [];
    $scope.privateStudies = [];

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
            AlertService.add('success', 'Successfully connected to rest-api', 3000);

            $scope.studies = studies;

            // Checking if studies are public or private
            // TODO: other cases not public or private
            $scope.studies.forEach( function(study){

              study.endpoint = endpoint; // Keep reference to endpoint

              if (study._embedded.ontologyTerm.fullName.split('\\')[1] ===
                'Public Studies') {
                $scope.publicStudies.push(study);
              } else {
                $scope.privateStudies.push(study);
              }

            });
          }, function (err) {
            AlertService.add('danger', 'Oops! Cannot connect to rest-api.');
            console.error(err);
          });
      });
    }

    function resetEndpointForm() {
      var formData = $scope.formData;
      formData.title = '';
      formData.url = '';
      formData.requestToken = '';
      formData.endpointForm.$setPristine();
    }

      _loadStudies();

  }]);
