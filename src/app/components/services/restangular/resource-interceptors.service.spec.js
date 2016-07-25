'use strict';

describe('ResourceService', function () {
    var ResourceInterceptors;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_ResourceInterceptors_) {
        ResourceInterceptors = _ResourceInterceptors_;
    }));

    describe('customResponseInterceptor', function () {

        var _data, _operation, _what, _res;

        beforeEach(function () {
            _data = {_embedded: {ontology_terms : 'ontology_terms', foo:'foo'}};
        });

        it ('should return data when operation is not getList', function () {
            _operation = 'foo';
            _what = 'what';
            _res = ResourceInterceptors.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual(_data);
        });

        it ('should return ontology_terms when operation is getList with concepts as param', function () {
            _operation = 'getList';
            _what = 'concepts';
            _res = ResourceInterceptors.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual('ontology_terms');
        });

        it ('should return data from given param when operation is getList', function () {
            _operation = 'getList';
            _what = 'foo';
            _res = ResourceInterceptors.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual('foo');
        });


    })

});
