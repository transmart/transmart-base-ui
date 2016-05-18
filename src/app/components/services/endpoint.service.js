'use strict';
/*jshint camelcase: false */

angular.module('transmartBaseUi')
  .factory('EndpointService',
  ['$rootScope', '$http', '$q', 'Restangular', '$cookies', '$window', '$location',
    function ($rootScope, $http, $q, Restangular, $cookies, $window, $location) {

      var service = {};

      // Contains all the endpoints currently connected to
      var endpoints = [];

      // Holds the endpoint which to save user specific settings to
      var masterEndpoint = null;

      var _newEndpointEvents = [];

      var cookieKeyForEndpoints = 'transmart-base-ui-v2.endpoints';
      var cookieKeyForSelectedEndpoint = 'transmart-base-ui-v2.selectedEndpoint';

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

        $cookies.putObject(cookieKeyForEndpoints, _end);
      };

      service.addEndpoint = function (endpoint) {
        endpoint.restangular = _newRestangularConfig(endpoint);
        endpoints.push(endpoint);
        service.saveEndpoint(endpoint);
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

            service.saveEndpoint(endpoint);

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
       * Save selected endpoint to cookie, so we know which endpoint we were
       * connecting to when the page is reloaded.
       * @param endpoint
       */
      service.saveSelectedEndpoint = function (endpoint) {
        $cookies.putObject(cookieKeyForSelectedEndpoint, endpoint);
      };

      /**
       * Save authorized endpoint to cookie
       * @param endpoint
         */
      service.saveEndpoint = function (endpoint) {
        var time = new Date ();

        endpoint.status = 'active';
        endpoint.expiresAt = time.setSeconds(time.getSeconds() + endpoint.expires_in);

        var restangular = endpoint.restangular || _newRestangularConfig(endpoint);
        delete endpoint.restangular;

        var storedEndpoints = $cookies.getObject(cookieKeyForEndpoints) || [];
        storedEndpoints.push(endpoint);
        $cookies.putObject(cookieKeyForEndpoints, storedEndpoints);

        // Save the restangular reference in the endpoint
        endpoint.restangular = restangular;
        endpoint.restangular.token = endpoint.access_token;

        service.triggerNewEndpointEvent();
      };

      /**
       * Returns endpoint with merged credentials extracted from URI
       * @param endpoint
       * @param strFragment
       * @returns {*}
         */
      service.mergeEndpointCredentials = function (endpoint, strFragment) {
        var fragmentObj = JSON.parse('{"' +
          decodeURI(
            strFragment
              .replace(/&/g, "\",\"") // replace '&' with ','
              .replace(/=/g,"\":\"")) + '"}' // replace '=' with ':'
        );
        return angular.merge(fragmentObj, endpoint);
      };


      /**
       * Get selected endpoint
       * @returns {*}
         */
      service.getSelectedEndpoint = function () {
        var selectedEndpoint = $cookies.getObject(cookieKeyForSelectedEndpoint);
        if (!selectedEndpoint) {
          throw new Error ('Cannot find selected endpoint');
        }
        return selectedEndpoint;
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
      service.navigateToAuthorizationPage = function (endpoint) {
        var currentHost = String($location.host()),
          currentPort = String($location.port()),
          currentProtocol = $location.protocol();

        // Cut off any '/'
        var url = endpoint.url;
        if (url.substring(url.length - 1, url.length) === '/') {
          url = url.substring(0, url.length - 1);
        }

        var authorizationUrl = url +
          '/oauth/authorize?response_type=token&client_id=glowingbear-js&redirect_uri=' +
          this.getRedirectURI( currentProtocol, currentHost, currentPort);

        $window.open(authorizationUrl, '_self');
      };

      service.retrieveStoredEndpoints = function () {
        var storedEndpoints = $cookies.getObject(cookieKeyForEndpoints) || [];
        storedEndpoints.forEach(function (endpoint) {
          endpoint.restangular = _newRestangularConfig(endpoint);
          endpoints.push(endpoint);
          if (endpoint.isMaster) {
            masterEndpoint = endpoint;
          }
        });
      };

      service.clearStoredEndpoints = function () {
        $cookies.remove(cookieKeyForEndpoints);
        endpoints = [];
        service.addEndpoint(masterEndpoint);
        service.triggerNewEndpointEvent();
      };

      service.authorizeEndpoint = function (endpoint) {
        // Remember which endpoint we're connecting to
        service.saveSelectedEndpoint(endpoint);
        service.navigateToAuthorizationPage(endpoint);
      };

      /** Initializes the master endpoint with the one specified if it
       *  is not present yet.
       * @param endpoint
       */
      service.initializeMasterEndpoint = function (endpoint) {
        if (!masterEndpoint) {
          masterEndpoint = endpoint;
          service.authorizeEndpoint(masterEndpoint);
        }
      };

      service.getMasterEndpoint = function () {
        return masterEndpoint;
      };

      service.invalidateEndpoint = function (endpoint) {
        endpoint.status = 'error';
        //TODO: properly handle malfunctioning endpoint
        //service.navigateToAuthorizationPage(endpoint);
      };

      var _newRestangularConfig = function (endpoint) {
        return Restangular.withConfig(function (RestangularConfigurer) {
          RestangularConfigurer.setBaseUrl(endpoint.url);
          RestangularConfigurer.setDefaultHeaders({
            'Authorization': 'Bearer ' + endpoint.access_token,
            'Accept': 'application/hal+json'
          });
        });
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
