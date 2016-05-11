'use strict';
/*jshint camelcase: false */

angular.module('transmartBaseUi')
  .factory('EndpointService',
  ['$rootScope', '$http', '$q', 'Restangular', '$cookies', '$window', '$location',
    function ($rootScope, $http, $q, Restangular, $cookies, $window, $location) {

      var service = {};

      var endpoints = [];

      var _newEndpointEvents = [];

      service.triggerNewEndpointEvent = function () {
        _newEndpointEvents.forEach(function (func) {
          func();
        });
      };

      service.registerNewEndpointEvent = function (func) {
        _newEndpointEvents.push(func);
      };

      service.getEndpoints = function () {
        return endpoints;
      };

      service.remove = function (endpoint) {
        var _in = endpoints.indexOf(endpoint);
        if (_in >= 0) {
          endpoints.splice(_in, 1);
        }

        // Remove nested restangular object
        var _end = _.map(endpoints, function(e){
          var _n = _.clone(e);
          _n.restangular = undefined;
          return _n;
        });

        $cookies.putObject('transmart-base-ui-v2.endpoints', _end);
      };

      service.addEndpoint = function (title, url) {
        url = _cleanUrl(url);
        // Store meta data and restangular instance in object
        var endpoint = {
          title: title,
          url: url,
          status: 'local'
        };
        _saveEndpointToCookies(endpoint);
        endpoint.restangular = _newRestangularConfig(endpoint);

        // Add endpoint to the list
        endpoints.push(endpoint);
        service.triggerNewEndpointEvent();
      };

      service.addOAuthEndpoint = function (title, url, requestToken) {
        var deferred = $q.defer();
        url = _cleanUrl(url);

        var data = {
          grant_type: 'implicit',
          client_id: 'glowingbear-js',
          client_secret: '',
          code: requestToken,
          redirect_uri: url + '/oauth/verify'
        };

        /*jshint undef: false */
        //data must be URL encoded to be passed to the POST body
        data = $.param(data);
        /*jshint undef: true */

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
            endpoint.restangular.token = response.access_token;

            // Add endpoint to the list
            endpoints.push(endpoint);
            service.triggerNewEndpointEvent();

            deferred.resolve(response);
          })
          .error(function (data) {
            deferred.reject(data);
          });

        return deferred.promise;
      };

      /**
       * Save selected endpoint to cookie
       * @param endpoint
         */
      service.saveSelectedEndpoint = function (endpoint) {
        $cookies.putObject('transmart-base-ui-v2.selectedEndpoint', endpoint);
      };

      /**
       * Save authorized endpoint to cookie
       * @param endpoint
         */
      service.saveAuthorizedEndpoint = function (endpoint) {
        var time = new Date ();

        endpoint.status = 'active';
        endpoint.expiresAt = time.setSeconds(time.getSeconds() + endpoint.expires_in);

        var storedEndpoints = $cookies.getObject('transmart-base-ui-v2.endpoints') || [];
        storedEndpoints.push(endpoint);
        $cookies.putObject('transmart-base-ui-v2.endpoints', storedEndpoints);

        // Create new restangular instance
        endpoint.restangular = _newRestangularConfig(endpoint);
        endpoint.restangular.token = endpoint.access_token;

        // Add endpoint to the list
        endpoints.push(endpoint);

        console.log(endpoint);

        service.triggerNewEndpointEvent();
      };

      /**
       *
       * @param endpoint
       * @param strFragment
       * @returns {*}
         */
      service.updateEndpointCredentials = function (endpoint, strFragment) {
        var fragmentObj = JSON.parse('{"' +
          decodeURI(
            strFragment
              .replace(/&/g, "\",\"") // replace '&' with ','
              .replace(/=/g,"\":\"")) + '"}' // replace '=' with ':'
        );
        return angular.merge(fragmentObj, service.getSelectedEndpoint());
      };


      /**
       * Get selected endpoint
       * @returns {*}
         */
      service.getSelectedEndpoint = function () {
        var storedEndpoints = $cookies.getObject('transmart-base-ui-v2.selectedEndpoint');
        if (!storedEndpoints) {
          throw new Error ('Cannot find selected endpoint');
        }
        return storedEndpoints;
      };

      /**
       * Return redirect URI
       * @param port {string}
       * @param host {string}
       * @param protocol {string}
         * @returns {string}
         */
      service.getRedirectURI = function (protocol, host, port) {
        if (['80', '443'].indexOf(port) >= 0) {
          port = '';
        } else {
          port = '%3A' + port;
        }
        return protocol + '%3A%2F%2F' + host + port + '%2Fconnections';
      };

      /**
       * Get oAuth url with params
       * @param url
         */
      service.navigateToAuthorizationPage = function (url, resourceUri) {

        // Cut off any '/'
        if (url.substring(url.length - 1, url.length) === '/') {
          url = url.substring(0, url.length - 1);
        }

        var authorizationUrl = url +
          '/oauth/authorize?response_type=token&client_id=glowingbear-js&redirect_uri=' +
          this.getRedirectURI( resourceUri.protocol, resourceUri.host, resourceUri.port);

        $window.open(authorizationUrl, '_self');
      };

      service.retrieveStoredEndpoints = function () {
          var storedEndpoints = $cookies.getObject('transmart-base-ui-v2.endpoints') || [];
          storedEndpoints.forEach(function (endpoint) {
            endpoint.restangular = _newRestangularConfig(endpoint);
            endpoints.push(endpoint);
          });
      };

      service.clearStoredEnpoints = function () {
        $cookies.remove('transmart-base-ui-v2.endpoints');
        endpoints = [];
        service.triggerNewEndpointEvent();
      };

      var _newRestangularConfig = function (end) {
        return Restangular.withConfig(function (RestangularConfigurer) {
          RestangularConfigurer.setBaseUrl(end.url);
          RestangularConfigurer.setDefaultHeaders({
            'Authorization': 'Bearer ' + end.access_token,
            'Accept': 'application/hal+json'
          });
        });
      };

      var _saveEndpointToCookies = function (end) {
        var storedEndpoints = $cookies.getObject('transmart-base-ui-v2.endpoints') || [];
        storedEndpoints.push(end);
        $cookies.putObject('transmart-base-ui-v2.endpoints', storedEndpoints);
      };

      var _cleanUrl = function (url) {
        // Cut off any '/'
        if (url.substring(url.length - 1, url.length) === '/') {
          url = url.substring(0, url.length - 1);
        }
        return url;
      };

      return service;
    }
  ]);
