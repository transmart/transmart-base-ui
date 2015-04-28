'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl',
  ['$scope', 'endpointService',
  function ($scope, endpointService) {

    $scope.endpoints = [];
    $scope.formData = {};

    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };

    $scope.oneAtATime = true;

    loadStudies();

    function loadStudies() {
      var endpoints = endpointService.getEndpoints();
      $scope.endpoints = endpoints;
      $scope.studies = [];
      endpoints.forEach(function(endpoint) {
        endpoint.restangular.all('studies').getList()
          .then(function (studies) {
            $scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});
            studies.forEach(function(study) {
              study.endpoint = endpoint;
              $scope.studies.push(study);
            });
          }, function (err) {
            $scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
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

    $scope.addResource = function() {
      var formData = $scope.formData;
      if (formData.requestToken) {
        endpointService.addOAuthEndpoint(formData.title, formData.url, formData.requestToken)
          .then(function() {
            resetEndpointForm();
            loadStudies();
          });
      }
      else {
        endpointService.addEndpoint(formData.title, formData.url);
        resetEndpointForm();
        loadStudies();
      }
    }

  }]);
