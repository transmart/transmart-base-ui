'use strict';

/**
 * Configuration for tranSMART-ui module
 * Injection of dependencies and base configuration
 */
angular.module('smartRApp', [ 'transmartBaseUiConstants'])
    .config(['$httpProvider', '$locationProvider', function($httpProvider, $locationProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

    }])
    .run(function($rootScope, $http, masterEndpointConfig) {
        // get plugin context path and put it in root scope
        var basePath = masterEndpointConfig.url;
       /* $http.get(basePath + '/SmartR/smartRContextPath').then(
            function(d) { $rootScope.smartRPath = d.data; },
            function(msg) { throw 'Error: ' + msg; }
        );*/
    });

