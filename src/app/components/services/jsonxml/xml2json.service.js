'use strict';

/**
 * Service that parses an XML string into a javascript object.
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name XML2JSONService
 */
angular.module('transmartBaseUi').factory('XML2JSONService', [function () {

    return {
        xml2json: xml2json
    };

    function xml2json(xml) {
        var x2js = new X2JS();
        var obj = x2js.xml_str2json(xml);
        return obj;
    }

}]);
