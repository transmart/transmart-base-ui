'use strict';

angular.module('transmartBaseUi')
  .controller('SaveCohortDialogCtrl', ['$scope', '$uibModalInstance', 'EndpointService', 'ChartService', 'QueryBuilderService', 'AlertService',
    function ($scope, $uibModalInstance, EndpointService, ChartService, QueryBuilderService, AlertService) {

      $scope.cohortName = '';

      /**
       * Saves the currently selected cohort to the backend.
       */
      $scope.ok = function () {
        //TODO: currently the cohort selection is saved to the master endpoint. Should it be saved to the endpoints corresponding to the concepts/filters instead?
        //TODO: how to deal with selections covering multiple studies?
        var endpoint = EndpointService.getMasterEndpoint();
        var i2b2Query = QueryBuilderService.convertCohortFiltersToXML(
          ChartService.getCohortFilters(), $scope.cohortName);

        var patientSets = endpoint.restangular.all('patient_sets');
        patientSets.customPOST(i2b2Query, undefined, undefined,
            { 'Content-Type': 'text/xml' })
          .then(function(result) {
            AlertService.add('success', 'Cohort saved OK: "' + $scope.cohortName + '", id: ' + result.id + ', size: ' + result.setSize);
          }, function(result) {
            AlertService.add('danger', 'There was an error saving cohort "' + $scope.cohortName + '": ' + result.data.message);
        });

        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };

    }]);
