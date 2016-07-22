'use strict';

/**
 * Configuration for tranSMART-ui module
 * Injection of dependencies and base configuration
 */
angular.module('transmartBaseUi', [
        'ngAnimate',
        'ngCookies',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'restangular',
        'ui.tree',
        'angular-loading-bar',
        'ngDragDrop',
        'ngCsv',
        'gridster',
        'ui.layout',
        'ui.grid',
        'ui.grid.pagination',
        'ui.grid.resizeColumns',
        'ui.grid.exporter',
        'ui.grid.selection',
        'angular-click-outside',
        'toggle-switch',
        'transmartBaseUiConstants'
    ])
    .config(['$stateProvider',  '$urlRouterProvider', 'RestangularProvider', 'cfpLoadingBarProvider', '$locationProvider', '$uibTooltipProvider',
        function ($stateProvider, $urlRouterProvider, RestangularProvider, cfpLoadingBarProvider, $locationProvider, $uibTooltipProvider) {

            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });

            // Abstract root state defining navbar and footer and an unnamed ui-view for child view injection.
            $stateProvider.state('site', {
                abstract: true,
                template: '<div ui-view> </div>',
                views: {
                    'navbar@': {
                        templateUrl: 'app/components/navbar/navbar.html',
                        controller: 'NavbarCtrl'
                    },
                    'footer@': {
                        templateUrl: 'app/components/footer/footer.html',
                        controller: 'FooterCtrl'
                    }
                }
            });

            // Default route
            $urlRouterProvider.otherwise('/');

            // =========================
            // Set restful api base url
            // =========================
            RestangularProvider.setDefaultHeaders(
                {'Accept': 'application/hal+json'}
            );

            // Set an interceptor in order to parse the API response
            // when getting a list of resources
            RestangularProvider.setResponseInterceptor(function (data, operation, what) {

                /**
                 * Get the last token when requested model is a string path
                 * @param what
                 * @returns {*}
                 * @private
                 */
                var _getLastToken = function (what) {
                    var _t = what.split('/').slice(1);
                    return what.indexOf('/') === -1 ? what : _t[_t.length - 1];
                };

                if (operation === 'getList') {
                    var _what, resp = data;
                    if (what === 'concepts') {
                        what = 'ontology_terms';
                        resp = data._embedded[what];
                    } else {
                        _what = _getLastToken(what);
                        resp = data._embedded[_what];
                    }
                    return resp;
                }
                return data;
            });

            // Using self link for self reference resources
            RestangularProvider.setRestangularFields({
                selfLink: 'self.link'
            });

            // Set default actions for popover
            $uibTooltipProvider.setTriggers({'click': 'never'});
            $uibTooltipProvider.options({
                placement: 'right',
                appendToBody: 'true',
                trigger: 'click'
            });

            // Remove spinner from http request loading bar
            cfpLoadingBarProvider.includeSpinner = false;

        }])

    .run(['$rootScope', '$location', '$cookieStore', '$http', 'EndpointService',
        function ($rootScope, $location, $cookieStore, $http, EndpointService) {

            // init globals
            $rootScope.globals = $cookieStore.get('globals') || {};

            EndpointService.initializeEndpoints();
        }]);
