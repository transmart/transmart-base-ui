'use strict';

angular.module('transmartBaseUi')

  .factory('EndpointService',
  ['$http', '$q', 'Restangular',
    function ($http, $q, Restangular) {

      var endpoints = [];
      var proxyUrl = 'http://localhost:8001/rest/';

      var service = {};

      service.getEndpoints = function() {
        return endpoints;
      };

      service.addEndpoint = function(title, url) {

        // Cut off any '/'
        if (url.substring(url.length-1, url.length) === '/') {
          url = url.substring(0, url.length-1);
        }

        // Create new restangular instance
        var newRestangular = Restangular;
        Restangular.setBaseUrl(url);
        Restangular.setDefaultHeaders({
          'Authorization': '',
          'Accept': 'application/hal+json'
          //'Endpoint': url
        });

        // Store meta data and restangular instance in object
        var endpoint = {
          title: title,
          url: url,
          restangular: newRestangular
        };

        // Add endpoint to the list
        endpoints = [];
        endpoints.push(endpoint);
      };

      service.addOAuthEndpoint = function(title, url, requestToken) {
        var deferred = $q.defer();

        // Cut off any '/'
        if (url.substring(url.length-1, url.length) === '/') {
          url = url.substring(0, url.length-1);
        }

        // Get the access_token using the request token (code)
        $http({
          url: url + '/oauth/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            grant_type: 'authorization_code',
            client_id: 'api-client',
            client_secret: 'api-client',
            code: requestToken
          }
        })
          .success(function (response) {
            var accessToken = response.access_token;

            // Create new restangular instance
            var newRestangular = Restangular;
            Restangular.setBaseUrl(url);
            Restangular.setDefaultHeaders({
              'Authorization': 'Bearer ' + accessToken,
              'Accept': 'application/hal+json'
              //'Endpoint': url
            });

            // Store meta data and restangular instance in object
            var endpoint = {
              title: title,
              url: url,
              accessToken: accessToken,
              restangular: newRestangular
            };

            // Add endpoint to the list
            endpoints = [];
            endpoints.push(endpoint);

            deferred.resolve(response);
          })
          .error(function (data) {
            deferred.reject(data);
          });

        return deferred.promise;
      };

      return service;
    }
  ]);

