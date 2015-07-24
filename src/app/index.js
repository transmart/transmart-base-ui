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
  'smart-table',
  'angular-loading-bar',
  'ngDragDrop',
  'ngCsv',
  'ui.layout',
  'gridster'
])
  .config( ['$stateProvider', 'RestangularProvider', '$tooltipProvider', 'cfpLoadingBarProvider',
    function ($stateProvider, RestangularProvider, $tooltipProvider, cfpLoadingBarProvider) {

      $stateProvider

        //.state('login', {
        //  url: '/login',
        //  templateUrl: 'app/components/login/login.html',
        //  controller: 'LoginCtrl'
        //})

        .state('home', {
          url: '/home',
          templateUrl: 'app/home/home.html',
          controller: 'HomeCtrl'
        })
        .state('workspace', {
          url: '/workspace?action&study&cohorts',
          templateUrl: 'app/main/main.html',
          controller: 'MainCtrl',
          reloadOnSearch: false
        })
        .state('connections', {
          url: '/connections',
          templateUrl: 'app/components/connections/connections.html',
          controller: 'ConnectionsCtrl'
        })
      ;

      // =========================
      // Set restful api base url
      // =========================
      RestangularProvider.setDefaultHeaders(
        {'Accept': 'application/hal+json'}
      );

      // Set an interceptor in order to parse the API response
      // when getting a list of resources
      RestangularProvider.setResponseInterceptor(function(data, operation, what) {
        //console.log(data);
        /**
         * Get the last token when requested model is a string path
         * @param what
         * @returns {*}
         * @private
         */
        var _getLastToken = function (what) {
          var _t = what.split('/').slice(1);
          return what.indexOf('/') === -1 ? what : _t[_t.length-1];
        };

        if (operation === 'getList') {
            var _what, resp = data;
            if (what === 'concepts') {
              what = 'ontology_terms';
              resp =  data._embedded[what];
            } else {
              _what = _getLastToken(what);
              resp =  data._embedded[_what];
            }
            return resp;
          }
        return data;
      });

      //// Using self link for self reference resources
      RestangularProvider.setRestangularFields({
        selfLink: 'self.link'
      });

      // Set default actions for popover
      $tooltipProvider.setTriggers({'click': 'never'});
      $tooltipProvider.options({
        placement: 'right',
        appendToBody: 'true',
        trigger: 'click'
      });

      // Remove spinner from http request loading bar
      cfpLoadingBarProvider.includeSpinner = false;

  }])

  .run(['$rootScope', '$location', '$cookieStore', '$http', 'EndpointService',
    function ($rootScope, $location, $cookieStore, $http, EndpointService) {

      // keep user logged in after page refresh
      $rootScope.globals = $cookieStore.get('globals') || {};

      if ($rootScope.globals.currentUser) {
        //$http.defaults.headers.common.Authorization = 'Basic ' + $rootScope.globals.currentUser.authdata;
      }

      EndpointService.retrieveStoredEndpoints();

      $rootScope.$on('$locationChangeStart', function () {
        if ($location.path() === '') {
          $location.path('/home');
        }
      });
    }]);
