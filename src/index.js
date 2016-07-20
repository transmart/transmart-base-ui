'use strict';

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
    .config(['$stateProvider', 'cfpLoadingBarProvider', '$locationProvider', '$uibTooltipProvider',
        function ($stateProvider,  cfpLoadingBarProvider, $locationProvider, $uibTooltipProvider) {

            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });

            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'app/containers/home/home.html',
                    controller: 'HomeCtrl'
                })
                .state('workspace', {
                    url: '/workspace?action&study&cohorts',
                    templateUrl: 'app/containers/main/main.html',
                    controller: 'MainCtrl',
                    reloadOnSearch: false
                })
                .state('connections', {
                    url: '/connections',
                    templateUrl: 'app/containers/connections/connections.html',
                    controller: 'ConnectionsCtrl'
                })
                .state('help', {
                    url: '/help',
                    templateUrl: 'app/containers/help/help.html'
                })
            ;

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

            $rootScope.$on('$locationChangeStart', function () {
                if ($location.path() === '') {
                    $location.path('/home');
                }
            });
        }]);
