'use strict';

angular.module('transmartBaseUi')
    .factory('CohortViewMocks', ['$q',
        function ($q) {
            var mock = {};

            mock.cohorts = function() {
                return [
                    {
                        "_links": {},
                        "_embedded": {
                            "values": [
                                {
                                    "name": "tranSMART's Query at Wed Nov 18 2015 17:11:06 GMT+0100",
                                    "setSize": 58,
                                    "status": "FINISHED",
                                    "id": 29691,
                                    "username": "guest",
                                    "errorMessage": null,
                                    "queryXML": "<qd:query_definition xmlns:qd='http://www.i2b2.org/xsd/cell/crc/psm/querydefinition/1.1/'>\n  <query_name>tranSMART's Query at Wed Nov 18 2015 17:11:06 GMT+0100</query_name>\n  <panel>\n    <invert>0</invert>\n    <item>\n      <item_key>\\\\Public Studies\\Public Studies\\GSE8581\\</item_key>\n    </item>\n  </panel>\n</qd:query_definition>",
                                    "_links": {
                                        "self": {
                                            "href": "/patient_sets/29691"
                                        }
                                    },
                                    "_embedded": {}
                                },
                                {
                                    "name": "Demo's Query at Wed, 04 May 2016 09:32:54 GMT",
                                    "setSize": 19,
                                    "status": "FINISHED",
                                    "id": 31063,
                                    "username": "guest",
                                    "errorMessage": null,
                                    "queryXML": "<qd:query_definition xmlns:qd='http://www.i2b2.org/xsd/cell/crc/psm/querydefinition/1.1/'>\n  <query_name>Demo's Query at Wed, 04 May 2016 09:32:54 GMT</query_name>\n  <panel>\n    <invert>0</invert>\n    <item>\n      <item_key>\\\\Public Studies\\Public Studies\\Cell-line\\</item_key>\n    </item>\n  </panel>\n</qd:query_definition>",
                                    "_links": {
                                        "self": {
                                            "href": "/patient_sets/31063"
                                        }
                                    },
                                    "_embedded": {}
                                },
                                {
                                    "name": "Demo's Query at Wed, 22 Jun 2016 11:43:35 GMT",
                                    "setSize": 591,
                                    "status": "FINISHED",
                                    "id": 31066,
                                    "username": "guest",
                                    "errorMessage": null,
                                    "queryXML": "<qd:query_definition xmlns:qd='http://www.i2b2.org/xsd/cell/crc/psm/querydefinition/1.1/'>\n  <query_name>Demo's Query at Wed, 22 Jun 2016 11:43:35 GMT</query_name>\n  <panel>\n    <invert>0</invert>\n    <item>\n      <item_key>\\\\Public Studies\\Public Studies\\TCGAov_CuratedByOV\\</item_key>\n    </item>\n  </panel>\n</qd:query_definition>",
                                    "_links": {
                                        "self": {
                                            "href": "/patient_sets/31066"
                                        }
                                    },
                                    "_embedded": {}
                                }
                            ]
                        }
                    }
                ];
            };

            return mock;
        }
    ]);
