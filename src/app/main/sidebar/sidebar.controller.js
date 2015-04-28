'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl',
  ['$scope', 'Restangular', 'endpointService',
  function ($scope, Restangular, endpointService) {

    $scope.formData = {};

    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };

    $scope.oneAtATime = true;

    loadStudies();

    function loadStudies() {
      $scope.studies = [];
      endpointService.getEndpoints().forEach(function(endpoint) {
        endpoint.restangular.all('studies').getList()
          .then(function (studies) {
            $scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});
            $scope.studies = $scope.studies.concat(studies);
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
