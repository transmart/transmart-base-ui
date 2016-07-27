'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name ResourceService
 */
angular.module('transmartBaseUi')
    .factory('ResourceService', function (Restangular, ResourceInterceptors) {

        var service = {};

        service.createResourceServiceByEndpoint = function (endpoint) {
            return Restangular.withConfig(function (RestangularConfigurer) {

                var fnResponseInterceptor = ResourceInterceptors.customResponseInterceptor;

                RestangularConfigurer.setBaseUrl(endpoint.url);
                RestangularConfigurer.setDefaultHeaders(
                    {
                        'Authorization': 'Bearer ' + endpoint.access_token,
                        'Accept': 'application/hal+json'
                    }
                );

                // Set an interceptor in order to parse the API response
                // when getting a list of resources
                RestangularConfigurer.addResponseInterceptor(fnResponseInterceptor);

                // Using self link for self reference resources
                RestangularConfigurer.setRestangularFields({
                    selfLink: 'self.link'
                });
            });
        };

        return service;
    });
