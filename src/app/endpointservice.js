'use strict';

angular.module('transmartBaseUi')

  .factory('endpointService',
  ['$http', '$q', 'Restangular',
    function ($http, $q, Restangular) {

      var endpoints = [];
      var proxyUrl = 'http://localhost:8001/rest/';

      var service = {};

      service.getEndpoints = function() {
        return endpoints;
      }

      service.addEndpoint = function(title, url) {
        
        // Create new restangular instance
        var newRestangular = Restangular.withConfig(function(RestangularConfigurer) {
              RestangularConfigurer.setBaseUrl(proxyUrl);
              RestangularConfigurer.setDefaultHeaders({
                'Accept': 'application/hal+json',
                'Endpoint': url
              });
            });

        // Store meta data and restangular instance in object
        var endpoint = {
          title: title,
          url: url,
          restangular: newRestangular
        }

        // Add endpoint to the list
        endpoints.push(endpoint);
      }

      service.addOAuthEndpoint = function(title, url, requestToken) {
        var deferred = $q.defer();

        // Make sure url ends with '/'
        if (url.substring(url.length-1, url.length) == '/') {
          url = url.substring(0, url.length-1);
        }

        // Get the access_token using the request token (code)
        $http({
          url: proxyUrl + 'oauth/token',
          method: 'GET',
          headers: {
            'Endpoint': url
          },
          params: {
            code: requestToken
          }
        })
          .success(function (response) {
            var access_token = response.access_token;

            // Create new restangular instance
            var newRestangular = Restangular.withConfig(function(RestangularConfigurer) {
              RestangularConfigurer.setBaseUrl(proxyUrl);
              RestangularConfigurer.setDefaultHeaders({
                'Accept': 'application/hal+json',
                'Authorization': 'Bearer ' + access_token,
                'Endpoint': url
              });
            });

            // Store meta data and restangular instance in object
            var endpoint = {
              title: title,
              url: url,
              access_token: access_token,
              restangular: newRestangular
            }

            // Add endpoint to the list
            endpoints.push(endpoint);

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

