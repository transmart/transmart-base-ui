'use strict';

angular.module('transmartBaseUi')
  .controller('SaveCohortDialogCtrl', ['$scope', '$uibModalInstance', 'EndpointService', 'ChartService', 'QueryBuilderService', 'AlertService',
    function ($scope, $uibModalInstance, EndpointService, ChartService, QueryBuilderService, AlertService) {

      $scope.cohortName = '';

      /**
       * Saves the currently selected cohort to the backend.
       */
      $scope.ok = function () {
        var endpoint = EndpointService.getMasterEndpoint();
        var i2b2Query = QueryBuilderService.convertQueryToXML(
          ChartService.getCohortFilters(), $scope.cohortName);

        var patientSets = endpoint.restangular.all('patient_sets');
        patientSets.customPOST(i2b2Query, undefined, undefined,
            { 'Content-Type': 'text/xml' })
          .then(function(result) {
            AlertService.add('success', 'Cohort saved OK: ' + result.setSize + ' included, id: ' + result.id);
          }, function(result) {
            AlertService.add('error', 'There was an error saving the cohort: ' + result.data.message);
        });

        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };

    }]);
