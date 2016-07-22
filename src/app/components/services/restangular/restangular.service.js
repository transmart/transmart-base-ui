'use strict';

angular.module('transmartBaseUi')
    .factory('ResourceService', function (Restangular) {

        var service = {};

        service.createResourceServiceByEndpoint = function (endpoint) {
            return Restangular.withConfig(function (RestangularConfigurer) {

                RestangularConfigurer.setBaseUrl(endpoint.url);
                RestangularConfigurer.setDefaultHeaders(
                    {
                        'Authorization': 'Bearer ' + endpoint.access_token,
                        'Accept': 'application/hal+json'
                    }
                );

                // Set an interceptor in order to parse the API response
                // when getting a list of resources
                RestangularConfigurer.addResponseInterceptor(function (data, operation, what) {

                    /**
                     * Get the last token when requested model is a string path
                     * @param what
                     * @returns {*}
                     * @private
                     */
                    var _getLastToken = function (what) {
                        var _t = what.split('/').slice(1);
                        return what.indexOf('/') === -1 ? what : _t[_t.length - 1];
                    };

                    if (operation === 'getList') {
                        var _what, resp = data;
                        if (what === 'concepts') {
                            what = 'ontology_terms';
                            resp = data._embedded[what];
                        } else if (what === 'studies') {
                            // nothing
                        } else
                        {
                            _what = _getLastToken(what);
                            resp = data._embedded[_what];
                        }
                        return resp;
                    }
                    return data;
                });

                // Using self link for self reference resources
                RestangularConfigurer.setRestangularFields({
                    selfLink: 'self.link'
                });
            });
        };

        return service;
    });
