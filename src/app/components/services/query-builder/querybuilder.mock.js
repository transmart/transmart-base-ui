'use strict';
/**
 * @Service QueryBuilderMocks
 * @Description Service layer exposing a mock layer for QueryBuilder operations.
 */
angular.module('transmartBaseUi')
    .factory('QueryBuilderMocks', [
        function () {
            var mock = {};

            mock.cohortFiltersWithCategories = function() {
                return [
                    {
                        name: 'Organism',
                        type: 'string',
                        label: '\\Public Studies\\GSE8581\\Subjects\\Organism\\',
                        study: {
                            type: 'public'
                        },
                        filters: []
                    },
                    {
                        name: 'Sex',
                        type: 'string',
                        label: '\\Public Studies\\GSE8581\\Subjects\\Sex\\',
                        study: {
                            type: 'public'
                        },
                        filters: ['female']
                    },
                    {
                        name: 'Diagnosis',
                        type: 'string',
                        label: '\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\',
                        study: {
                            type: 'public'
                        },
                        filters: ['carcinoid', 'hematoma']
                    }
                ];
            };

            mock.cohortFiltersWithCategoriesResponse = function() {
                return [{
                    panel_number: 1,
                    invert: 0,
                    total_item_occurrences: 1,
                    item: [{
                        item_name: "Organism",
                        item_key: "\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Organism\\",
                        tooltip: "\\Public Studies\\GSE8581\\Subjects\\Organism\\",
                        class: "ENC"
                    }]
                }, {
                    panel_number: 2,
                    invert: 0,
                    total_item_occurrences: 1,
                    item: [{
                        item_name: "female",
                        item_key: "\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Sex\\female",
                        tooltip: "\\Public Studies\\GSE8581\\Subjects\\Sex\\female",
                        class: "ENC"
                    }]
                }, {
                    panel_number: 3,
                    invert: 0,
                    total_item_occurrences: 1,
                    item: [{
                        item_name: "carcinoid",
                        item_key: "\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\carcinoid",
                        tooltip: "\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\carcinoid",
                        class: "ENC"
                    }, {
                        item_name: "hematoma",
                        item_key: "\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\hematoma",
                        tooltip: "\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\hematoma",
                        class: "ENC"
                    }]
                }];
            };

            mock.cohortFiltersWithNumberRanges = function() {
                return [
                    {
                        name: 'Age',
                        type: 'number',
                        label: '\\Public Studies\\GSE8581\\Subjects\\Age\\',
                        study: {
                            type: 'public'
                        },
                        filters: [[65, 70]]
                    },
                    {
                        name: 'Height',
                        type: 'number',
                        label: '\\Public Studies\\GSE8581\\Subjects\\Height\\',
                        study: {
                            type: 'public'
                        },
                        filters: []
                    }
                ];
            };

            mock.cohortFiltersWithNumberRangesResponse = function() {
                return [
                    {
                        panel_number: 1,
                        invert: 0,
                        total_item_occurrences: 1,
                        item: [{
                            item_name: 'Age',
                            item_key: '\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Age\\',
                            tooltip: '\\Public Studies\\GSE8581\\Subjects\\Age\\',
                            class: 'ENC',
                            constrain_by_value: {
                                value_operator: 'BETWEEN',
                                value_constraint: '65 and 70',
                                value_type: 'NUMBER'
                            }
                        }]
                    },
                    {
                        panel_number: 2,
                        invert: 0,
                        total_item_occurrences: 1,
                        item: [{
                            item_name: 'Height',
                            item_key: '\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Height\\',
                            tooltip: '\\Public Studies\\GSE8581\\Subjects\\Height\\',
                            class: 'ENC'
                        }]
                    }
                ];
            };

            mock.cohortFiltersWithHighDimData = function() {
                return [
                    {
                        name: 'Lung',
                        type: 'highdim',
                        label: '\\Private Studies\\GSE8581\\Biomarker Data\\GPL570\\Lung\\',
                        study: {
                            type: 'private'
                        },
                        filters: []
                    }
                ];

            };

            mock.cohortFiltersWithHighDimDataResponse = function() {
                return [{
                    panel_number: 1,
                    invert: 0,
                    total_item_occurrences: 1,
                    item: [{
                        item_name: 'Lung',
                        item_key: '\\\\Private Studies\\Private Studies\\GSE8581\\Biomarker Data\\GPL570\\Lung\\',
                        tooltip: '\\Private Studies\\GSE8581\\Biomarker Data\\GPL570\\Lung\\',
                        class: 'ENC'
                    }]
                }];
            };

            mock.cohortFiltersToXML = function() {
                return {
                    cohortName: 'my cohort',
                    cohortFilters: [
                        {
                            name: 'Age',
                            type: 'number',
                            label: '\\Public Studies\\GSE8581\\Subjects\\Age\\',
                            study: {
                                type: 'public'
                            },
                            filters: [[65, 70]]
                        },
                        {
                            name: 'Diagnosis',
                            type: 'string',
                            label: '\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\',
                            study: {
                                type: 'public'
                            },
                            filters: ['carcinoid', 'hematoma']
                        }
                    ]
                }
            };

            mock.cohortFiltersToXMLResponse = function() {
                var q = '<query_definition><query_name>my cohort</query_name><panel>' +
                    '<panel_number>1</panel_number><invert>0</invert><total_item_occurrences>1</total_item_occurrences>' +
                    '<item><item_name>Age</item_name><item_key>\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Age\\</item_key>' +
                    '<tooltip>\\Public Studies\\GSE8581\\Subjects\\Age\\</tooltip><class>ENC</class>' +
                    '<constrain_by_value><value_operator>BETWEEN</value_operator><value_constraint>65 and 70</value_constraint' +
                    '><value_type>NUMBER</value_type></constrain_by_value></item></panel><panel><panel_number>2</panel_number' +
                    '><invert>0</invert><total_item_occurrences>1</total_item_occurrences><item><item_name>carcinoid</item_name>' +
                    '<item_key>\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\carcinoid</item_key>' +
                    '<tooltip>\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\carcinoid</tooltip><class>ENC</class></item>' +
                    '<item><item_name>hematoma</item_name><item_key>\\\\Public Studies\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\hematoma</item_key>' +
                    '<tooltip>\\Public Studies\\GSE8581\\Subjects\\Diagnosis\\hematoma</tooltip><class>ENC</class></item></panel></query_definition>'

                return q;
            };

            return mock;
        }
    ]);
