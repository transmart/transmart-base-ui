'use strict';

angular.module('transmartBaseUi')

  .factory('endpointService',
  ['$http', '$q', 'Restangular',
    function ($http, $q, Restangular) {

      var restAngularProviders = [];

      var service = {};

      service.getEndpoints = function() {
        return restAngularProviders;
      }

      service.addEndpoint = function(title, url) {
        var endpoint = Restangular.withConfig(function(RestangularConfigurer) {
              RestangularConfigurer.setBaseUrl(url);
              RestangularConfigurer.setDefaultHeaders({
                'Accept': 'application/hal+json'
              });
            });
        restAngularProviders.push(endpoint);
      }

      service.addOAuthEndpoint = function(title, url, requestToken) {
        var deferred = $q.defer();

        // Make sure url ends with '/'
        if (url.substring(url.length-1, url.length) != '/') {
          url += '/';
        }

        // Get the access_token using the request token (code)
        $http({
          url: url + 'oauth/token', 
          method: 'GET',
          params: {
            grant_type: 'authorization_code',
            client_id: 'api-client',
            client_secret: 'api-client',
            code: requestToken,
            redirect_uri: url + 'oauth/verify'
          }
        })
          .success(function (response) {
            var access_token = response.access_token;

            // Create new rest endpoint
            var endpoint = Restangular.withConfig(function(RestangularConfigurer) {
              RestangularConfigurer.setBaseUrl(url);
              RestangularConfigurer.setDefaultHeaders({
                'Accept': 'application/hal+json',
                'Authorization': 'Bearer ' + access_token
              });
            });

            // Add endpoint to the list
            restAngularProviders.push(endpoint);

            deferred.resolve(response);
          })
          .error(function (data, status) {
            deferred.reject(data);
          });

        return deferred.promise;
      }

      return service;
    }
  ]);

