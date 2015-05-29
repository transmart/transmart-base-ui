'use strict';

angular.module('transmartBaseUi', [
  'ngAnimate',
  'ngCookies',
  'ngTouch',
  'ngSanitize',
  'restangular',
  'ui.router',
  'ui.bootstrap',
  'restangular',
  'ui.tree',
  'smart-table'
])

  .config( ['$stateProvider', '$urlRouterProvider', 'RestangularProvider',
    function ($stateProvider, $urlRouterProvider, RestangularProvider) {

      $stateProvider
        .state('main', {
          url: '/',
          templateUrl: 'app/main/main.html',
          controller: 'MainCtrl'
        })
        .state('login', {
          url: '/login',
          templateUrl: 'components/login/login.html',
          controller: 'LoginCtrl'
        });

      // =========================
      // Set restful api base url
      // =========================
      RestangularProvider.setBaseUrl('http://localhost:8080/transmart-rest-api');
      RestangularProvider.setDefaultHeaders(
        {'Accept': 'application/hal+json'}
      );

      // Set an interceptor in order to parse the API response
      // when getting a list of resources
      RestangularProvider.setResponseInterceptor(function(data, operation, what) {
        if (operation === 'getList') {
            var resp = data;
            if (what === 'concepts') {
              what = 'ontology_terms';
              resp =  data._embedded[what];
            }
            else if (what === 'subjects' || what.slice(-8) === 'subjects') {
              resp =  data._embedded.subjects;
            } else {
              resp =  data._embedded[what];
            }
            return resp;
          }
        return data;
      });

      //// Using self link for self reference resources
      RestangularProvider.setRestangularFields({
        selfLink: 'self.link'
      });
  }])

  .run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {

      // keep user logged in after page refresh
      $rootScope.globals = $cookieStore.get('globals') || {};

      if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common.Authorization = 'Basic ' + $rootScope.globals.currentUser.authdata;
      }

      $rootScope.$on('$locationChangeStart', function () {
        // redirect to login page if not logged in
        if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
          $location.path('/login');
        }
      });
    }]);
