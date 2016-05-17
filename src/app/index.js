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
  'gridster',
  'ui.layout'
])
  .config( ['$stateProvider', 'RestangularProvider', 'cfpLoadingBarProvider', '$locationProvider', '$uibTooltipProvider',
    function ($stateProvider, RestangularProvider, cfpLoadingBarProvider, $locationProvider, $uibTooltipProvider) {

      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      $stateProvider
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
          templateUrl: 'app/connections/connections.html',
          controller: 'ConnectionsCtrl'
        })
        .state('help', {
          url: '/help',
          templateUrl: 'app/help/help.html'
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

      EndpointService.retrieveStoredEndpoints(); // includes master endpoint
      //TODO: make configurable or determine automatically:
      var masterEndpoint = {title: 'transmart-gb', url: 'http://transmart-gb.thehyve.net/transmart', isOAuth: true, isMaster: true};
      EndpointService.initializeMasterEndpoint(masterEndpoint);

      $rootScope.$on('$locationChangeStart', function () {
        if ($location.path() === '') {
          $location.path('/home');
        }
      });
    }]);
