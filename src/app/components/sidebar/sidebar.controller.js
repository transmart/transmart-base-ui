'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name SidebarCtrl
 */
angular.module('transmartBaseUi')
    .controller('SidebarCtrl', ['$scope', 'StudyListService', 'EndpointService',
        function ($scope, StudyListService, EndpointService) {

            var vm = this;

            vm.publicStudies = [];
            vm.privateStudies = [];

            vm.searchTerm = '';
            // Default to false (OR) for toggle switch
            vm.searchMode = false;
            vm.operator = 'OR';
            vm.searchKeys = [];

            $scope.$watch('searchMode', function (newVal) {
                vm.operator = newVal ? 'AND' : 'OR';
                StudyListService.showStudiesByKeys(vm.searchKeys, vm.operator);
            });

            /**
             * Add search key, invoked when user press Enter key in search input box.
             * @memberof SidebarCtrl
             */
            vm.addSearchKey = function () {
                if (vm.searchKeys.indexOf(vm.searchTerm) < 0 && vm.searchTerm.trim() !== '') {
                    vm.searchKeys.push(vm.searchTerm);
                    vm.searchTerm = '';
                    // search metadata
                    StudyListService.showStudiesByKeys(vm.searchKeys, vm.operator);
                }
            };

            /**
             * Clear all search keys
             * @memberof SidebarCtrl
             */
            vm.removeAllSearchKeys = function () {
                vm.searchKeys = [];
                StudyListService.showAll();
            };

            /**
             * Remove a search key
             * @memberof SidebarCtrl
             * @param searchKey
             */
            vm.removeSearchKey = function (searchKey) {
                var idx = vm.searchKeys.indexOf(searchKey);
                if (idx > -1) {
                    vm.searchKeys.splice(idx, 1);
                }
                // Re-display studies of remaining matched search keywords or show all studies when there's no search keys left
                vm.searchKeys.length > 0 ?
                    StudyListService.showStudiesByKeys(vm.searchKeys, vm.operator) : StudyListService.showAll();
            };

            /**
             * Load studies from available endpoints
             * @memberof SidebarCtrl
             */
            vm.loadStudies = function () {
                var _endpoints = EndpointService.getEndpoints(); // get available endpoints

                _.each(_endpoints, function (endpoint) {
                    StudyListService.loadStudyList(endpoint).then(function (result) {
                        vm.publicStudies = StudyListService.getPublicStudies();
                        vm.privateStudies = StudyListService.getPrivateStudies();
                    }, function () {
                        EndpointService.invalidateEndpoint(endpoint);
                    });
                });
            };

            vm.loadStudies();
        }])
    .directive('buEnterKey', function () {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs, ctrls) {
                $element.bind("keypress", function (event) {
                    var keyCode = event.which || event.keyCode;
                    if (keyCode === 13) {
                        $scope.$apply(function () {
                            $scope.$eval($attrs.buEnterKey, {$event: event});
                        });
                    }
                });
            }
        }
    });
