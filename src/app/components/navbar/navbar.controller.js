'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name NavbarCtrl
 */
angular.module('transmartBaseUi')
    .controller('NavbarCtrl', ['$scope', 'EndpointService', 'ChartService', '$uibModal',
        function ($scope, EndpointService, ChartService) {

            $scope.date = new Date();

            $scope.navigations = [
                {
                    label: 'Home',
                    path: 'home',
                    isActive: true
                },
                {
                    label: 'Workspace',
                    isActive: false
                },
                {
                    label: 'Data Sources',
                    path: 'connections',
                    children: [],
                    isActive: false
                }
            ];

            $scope.setActiveNavItem = function (idx) {
                for (var i = 0; i < $scope.navigations.length; i++) {
                    $scope.navigations[i].isActive = false;
                }
                $scope.navigations[idx].isActive = true;
            };

            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };

            $scope.exportToFile = function () {
                ChartService.exportToFile(
                    EndpointService.getEndpoints(),
                    ChartService.getCohortFilters()
                );
            };

        }]);
