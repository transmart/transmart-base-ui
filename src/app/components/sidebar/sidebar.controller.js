'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name SidebarCtrl
 */
angular.module('transmartBaseUi')
    .controller('SidebarCtrl', ['$scope', 'StudyListService', 'EndpointService',
        function ($scope, StudyListService, EndpointService) {

            var ws = this;

            ws.publicStudies = [];
            ws.privateStudies = [];

            ws.searchTerm = '';
            // Default to false (OR) for toggle switch
            ws.searchMode = false;
            ws.operator = 'OR';
            ws.searchKeys = [];

            $scope.$watch('searchMode', function (newVal) {
                ws.operator = newVal ? 'AND' : 'OR';
                StudyListService.showStudiesByKeys(ws.searchKeys, ws.operator);
            });

            /**
             * Add search key, invoked when user press Enter key in search input box.
             * @memberof SidebarCtrl
             */
            ws.addSearchKey = function () {
                if (ws.searchKeys.indexOf(ws.searchTerm) < 0 && ws.searchTerm.trim() !== '') {
                    ws.searchKeys.push(ws.searchTerm);
                    ws.searchTerm = '';
                    // search metadata
                    StudyListService.showStudiesByKeys(ws.searchKeys, ws.operator);
                }
            };

            /**
             * Clear all search keys
             * @memberof SidebarCtrl
             */
            ws.removeAllSearchKeys = function () {
                ws.searchKeys = [];
                StudyListService.showAll();
            };

            /**
             * Remove a search key
             * @memberof SidebarCtrl
             * @param searchKey
             */
            ws.removeSearchKey = function (searchKey) {
                var idx = ws.searchKeys.indexOf(searchKey);
                if (idx > -1) {
                    ws.searchKeys.splice(idx, 1);
                }
                // Re-display studies of remaining matched search keywords or show all studies when there's no search keys left
                ws.searchKeys.length > 0 ?
                    StudyListService.showStudiesByKeys(ws.searchKeys, ws.operator) : StudyListService.showAll();
            };

            /**
             * Load studies from available endpoints
             * @memberof SidebarCtrl
             */
            ws.loadStudies = function () {
                var _endpoints = EndpointService.getEndpoints(); // get available endpoints

                _.each(_endpoints, function (endpoint) {
                    StudyListService.loadStudyList(endpoint).then(function (result) {
                        ws.publicStudies = StudyListService.getPublicStudies();
                        ws.privateStudies = StudyListService.getPrivateStudies();
                    }, function () {
                        EndpointService.invalidateEndpoint(endpoint);
                    });
                });
            };

            ws.loadStudies();


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
