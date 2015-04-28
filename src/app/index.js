'use strict';

angular.module('transmartBaseUi', [
  'ngAnimate',
  'ngCookies',
  'ngTouch',
  'ngSanitize',
  'restangular',
  'ui.router',
  'ui.bootstrap',
  'restangular'
])

  .config( ['$stateProvider', 'RestangularProvider',
    function ($stateProvider, RestangularProvider) {

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
        {"Accept": 'application/hal+json'}
      );
      // Set an interceptor in order to parse the API response
      // when getting a list of resources
      RestangularProvider.setResponseInterceptor(function(data, operation, what) {
        if (operation == 'getList') {
          var resp =  data._embedded[what];
          resp._links = data._links;
          return resp
        }
        return data;
      });

      //// Using self link for self reference resources
      RestangularProvider.setRestangularFields({
        selfLink: 'self.link'
      });
  }])

  .run(['$rootScope', '$location', '$cookieStore', '$http', 'endpointService',
    function ($rootScope, $location, $cookieStore, $http, endpointService) {

      endpointService.addEndpoint('Local', 'http://localhost:8080/transmart-rest-api');

      // keep user logged in after page refresh
      $rootScope.globals = $cookieStore.get('globals') || {};

      if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
      }

      $rootScope.$on('$locationChangeStart', function (event, next, current) {
        // redirect to login page if not logged in
        if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
          $location.path('/login');
        }
      });
    }]);
