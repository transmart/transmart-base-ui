'use strict';

angular.module('transmartBaseUi')
  .factory('EndpointService',
  ['$rootScope', '$http', '$q', 'Restangular', '$cookies',
    function ($rootScope, $http, $q, Restangular, $cookies) {

      var _endpoints = [];
      var service = {};

      service.getEndpoints = function() {
        return _endpoints;
      };

      service.addEndpoint = function(title, url) {
        url = _cleanUrl(url);
        // Store meta data and restangular instance in object
        var endpoint = {
          title: title,
          url: url,
          status: 'local'
        };
        endpoint.restangular = _newRestangularConfig(endpoint);
        // Add endpoint to the list
        _endpoints.push(endpoint);
      };

      service.addOAuthEndpoint = function(title, url, requestToken) {
        var deferred = $q.defer();
        url = _cleanUrl(url);

        var data = {
          grant_type: 'authorization_code',
          client_id: 'api-client',
          client_secret: 'api-client',
          code: requestToken,
          redirect_uri: url + '/oauth/verify'
        };
        //data must be URL encoded to be passed to the POST body
        data = $.param(data);

        // Get the access_token using the request token (code)
        $http({
          url: url + '/oauth/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: data
        })
          .success(function (response) {
            //Calculate expriation time for the token
            var time = new Date();
            time = time.setSeconds(time.getSeconds() + response.expires_in);
            // Store meta data and restangular instance in object
            var endpoint = {
              title: title,
              url: url,
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
              expiresAt: time,
              status: 'active'
            };

            _saveEndpointToCookies(endpoint);
            // Create new restangular instance
            endpoint.restangular = _newRestangularConfig(endpoint);
            // Add endpoint to the list
            _endpoints.push(endpoint);

            deferred.resolve(response);
          })
          .error(function (data) {
            deferred.reject(data);
          });

        return deferred.promise;
      };

      service.retrieveStoredEndpoints = function() {
        if($rootScope.globals.currentUser){
          var storedEnpoints = $cookies.getObject('endpoints' + $rootScope.globals.currentUser.authdata) || [];
          storedEnpoints.forEach(function (endpoint) {
            endpoint.restangular = _newRestangularConfig(endpoint);
            _endpoints.push(endpoint);
          });
        }
      };

      service.clearStoredEnpoints = function(){
        $cookies.remove('endpoints' + $rootScope.globals.currentUser.authdata);
        _endpoints = [];
      };

      var _newRestangularConfig = function (end) {
        return Restangular.withConfig(function(RestangularConfigurer) {
          RestangularConfigurer.setBaseUrl(end.url);
          RestangularConfigurer.setDefaultHeaders({
            'Authorization': 'Bearer ' + end.accessToken,
            'Accept': 'application/hal+json'
          });
        });
      };

      var _saveEndpointToCookies = function (end) {
        var storedEnpoints = $cookies.getObject('endpoints' + $rootScope.globals.currentUser.authdata) || [];
        storedEnpoints.push(end);
        $cookies.putObject('endpoints' + $rootScope.globals.currentUser.authdata, storedEnpoints);
      };

      var _cleanUrl = function (url) {
        // Cut off any '/'
        if (url.substring(url.length-1, url.length) === '/') {
          url = url.substring(0, url.length-1);
        }
        return url;
      };

      return service;
    }
  ]);
