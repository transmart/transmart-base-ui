'use strict';

angular.module('transmartBaseUi')
  .controller('ConnectionsCtrl', ['$scope', '$location', 'AlertService', 'EndpointService',
    function ($scope, $location, AlertService , EndpointService) {

    $scope.formData = {};
    $scope.endpoints = EndpointService.getEndpoints();

    var _updateEndpoints = function (){
      $scope.endpoints = EndpointService.getEndpoints();
    };
    EndpointService.registerNewEndpointEvent(_updateEndpoints);

    $scope.clearSavedEndpoints = EndpointService.clearStoredEnpoints;
    $scope.navigateToAuthorizationPage = function(){
      EndpointService.navigateToAuthorizationPage($scope.formData.url);
    };

    $scope.addResource = function() {
      var formData = $scope.formData;
      if (formData.requestToken) {
        EndpointService.addOAuthEndpoint(formData.title, formData.url, formData.requestToken)
          .then(function() {
            $scope.resetEndpointForm();
          });
      }
      else {
        EndpointService.addEndpoint(formData.title, formData.url);
        $scope.resetEndpointForm();
      }
      $scope.endpointTabOpen = false;
    };

    $scope.populateDefaultApi = function(name, link) {
      $scope.formData.title = name;
      $scope.formData.url = link;
      $scope.formData.requestToken = '';
    };

    $scope.resetEndpointForm = function () {
      var formData = $scope.formData;
      formData.title = '';
      formData.url = '';
      formData.requestToken = '';
      formData.endpointForm.$setPristine();
    };

  }]);
