'use strict';

describe('XML2JSONService Unit Tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var XML2JSONService;
    beforeEach(inject(function (_XML2JSONService_) {
        XML2JSONService = _XML2JSONService_;
    }));

    it('should parse xml to javascript object', function () {
        var xml = "<data><users><firstName>John</firstName><lastName>Smith</lastName></users><users><firstName>Arthur</firstName><lastName>Dent</lastName></users></data>";
        var obj = XML2JSONService.xml2json(xml);
        expect(obj).toEqual(
            {
                data: {
                    users: [
                        {
                            firstName: "John",
                            lastName: "Smith"
                        },
                        {
                            firstName: "Arthur",
                            lastName: "Dent"
                        }
                    ]
                }
            });
    });

});
