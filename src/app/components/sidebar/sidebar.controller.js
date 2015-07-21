'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl', ['$scope', '$rootScope', '$window', 'Restangular', 'EndpointService', 'AlertService',
    function ($scope, $rootScope, $window, Restangular, EndpointService) {

      $rootScope.publicStudies = []; // TODO MOVE THIS TO SERVICE
      $rootScope.privateStudies = []; // TODO MOVE THIS TO SERVICE
      $scope.searchTerm = '';

      var _loadStudies = function () {

        var _endpoints = EndpointService.getEndpoints();

        $rootScope.publicStudies = [];
        $rootScope.privateStudies = [];

        // Load studies from each endpoints
        _endpoints.forEach(function (endpoint) {

          endpoint.restangular.all('studies').getList()
            .then(function (studies) {
              console.log(studies);
              endpoint.status = 'success';
              $scope.studies = studies;

              // Tell homepage that studies is loaded
              $scope.$emit('howManyStudiesLoaded', $scope.studies.length);

              if (studies.length > 0) {
                $scope.endpointTabOpen = true;
              }

              // Checking if studies are public or private
              $scope.studies.forEach(function (study) {
                study.endpoint = endpoint; // Keep reference to endpoint
                if (study._embedded.ontologyTerm.fullName.split('\\')[1] ===
                  'Public Studies') {
                  $rootScope.publicStudies.push(study);
                } else {
                  $rootScope.privateStudies.push(study);
                }
              });
            }, function () {
              // AlertService.add('danger', 'Could not load studies from API: ' +
              //  endpoint.url, 3000);
            });
          endpoint.status = 'error';
        });


      };

      EndpointService.registerNewEndpointEvent(_loadStudies); // register event

      // ***************************************************************************************************
      // TODO: checkout active connections, doesn't have to load studies each time users open this controller
      // ***************************************************************************************************
      _loadStudies();

    }]);
