'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', '$rootScope', '$window', 'Restangular', 'EndpointService', 'AlertService',
    function ($scope, $rootScope, $window, Restangular, EndpointService, AlertService) {

    $scope.publicStudies = [];
    $scope.privateStudies = [];

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
            $scope.$emit('howManyStudiesLoaded', $scope.studies.length);
            if(studies.length > 0) $scope.endpointTabOpen = true;
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

    EndpointService.registerNewEndpointEvent(_loadStudies);

    _loadStudies();
  }]);
