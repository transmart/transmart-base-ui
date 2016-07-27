'use strict';

angular.module('transmartBaseUi')
    .controller('ConnectionsCtrl', ['$scope', '$location', 'EndpointService', 'StudyListService', 'AlertService',
        function ($scope, $location, EndpointService, StudyListService, AlertService) {

            var sc = this;

            // alerts
            sc.close = AlertService.remove;
            sc.alerts = AlertService.get();

            // form data obj
            sc.formData = {};

            // get list of stored endpoints (if any)
            sc.endpoints = EndpointService.getEndpoints();

            // Predefined endpoints
            sc.connections = [
                {title: 'transmart-gb', url: 'http://transmart-gb.thehyve.net/transmart', isOAuth: true},
                {
                    title: 'transmart-test-translocation',
                    url: 'http://transmart-test-translocation.thehyve.net/transmart',
                    isOAuth: true
                }
            ];

            sc.selectedConnection = {};

            /**
             * Empty endpoints
             */
            sc.clearSavedEndpoints = function () {
                EndpointService.clearStoredEndpoints();
                sc.endpoints = EndpointService.getEndpoints();
                sc.publicStudies = StudyListService.getPublicStudies();
                sc.privateStudies = StudyListService.getPrivateStudies();
            };

            /**
             * Navigate to authorization page
             */
            sc.navigateToAuthorizationPage = function () {
                // check selected connection
                var isSelected = _.filter(EndpointService.getEndpoints(), {url: sc.selectedConnection.url});

                if (isSelected.length > 0) {
                    AlertService.add('warning', 'You are already connected to ' + sc.selectedConnection.url);
                    return false;
                }

                EndpointService.authorizeEndpoint(sc.selectedConnection);
            };

            /**
             * Populate selected endpoint
             */
            sc.populateDefaultApi = function () {
                sc.formData.title = sc.selectedConnection.label;
                sc.formData.url = sc.selectedConnection.url;
                sc.formData.requestToken = '';
            };

            /**
             * Remove an endpoint
             * @param endpoint
             */
            sc.removeEndpoint = function (endpoint) {
                EndpointService.removeEndpoint(endpoint);

                // delete study that has associated endpoint
                StudyListService.removeStudiesByEndpoint(endpoint);
                sc.publicStudies = StudyListService.getPublicStudies();
                sc.privateStudies = StudyListService.getPrivateStudies();
            };

            /**
             * Get status icon
             * @param endpoint
             * @returns {string}
             */
            sc.getStatusIcon = function (endpoint) {
                var glyphicon = 'glyphicon glyphicon-ban-circle';
                if (endpoint.status === 'active') {
                    glyphicon = 'glyphicon-ok text-success';
                } else if (endpoint.status === 'error') {
                    glyphicon = 'glyphicon-warning-sign text-warning';
                } else if (endpoint.status === 'local') {
                    glyphicon = 'glyphicon glyphicon-hdd text-success';
                }
                return glyphicon;
            };

        }]);
