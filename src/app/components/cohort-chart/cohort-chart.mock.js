'use strict';
/**
 * @Service CohortChartMocks
 * @Description Service layer exposing mocks for gridster and cohort charts
 */
angular.module('transmartBaseUi')
	.factory('CohortChartMocks',
		function () {
			var service = {};

			service.getBoxId = function () {
			    return 'cohort-selection-box-id-0';
            };

            service.getDropEvent = function() {
                var boxId = service.getBoxId();
                var event = {
                    type: 'drop',
                    target: 'div#main-chart-container-'+boxId,
                    cancelable: true,
                    bubbles: true,
                    metaKey: false
                };

                return event;
            };

            service.getNodes = function() {
                var nodes = {
                    loaded: false,
                    nodes: [],
                    study: {},
                    restObj: {},
                    title: "Subjects",
                    total: 58
                };

                return nodes;
            };

            service.getMockLabels = function() {
                var boxId = service.getBoxId();
                var labels = [
                    {
                        col: 0,
                        filters: undefined,
                        label: "\\Public Studies\\GSE8581\Subjects\\Age\\",
                        labelId: 0,
                        name: "Age",
                        row: 0,
                        sizeX: 3,
                        sizeY: 3,
                        study: {
                            id: "GSE8581",
                            _embedded: {
                                ontologyTerm: {
                                    fullName: "\\Public Studies\\GSE8581\\",
                                    key: "\\\\Public Studies\\Public Studies\\GSE8581\\",
                                    metadata: {
                                        Experiment: "exp1",
                                        Organism: "Homo sapiens",
                                        Status: "Public",
                                        Summary: "COPD Study",
                                        Title: "Human COPD"
                                    },
                                    name: "GSE8581",
                                    type: "STUDY"

                                }
                            }
                        },
                        type: "number",
                        boxId: boxId
                    },
                    {
                        col: 0,
                        filters: undefined,
                        label: "\\Public Studies\\GSE8581\\Subjects\\Ethnicity\\",
                        labelId: 1,
                        name: "Ethnicity",
                        row: 0,
                        sizeX: 3,
                        sizeY: 3,
                        study: {
                            id: "GSE8581",
                            _embedded: {
                                ontologyTerm: {
                                    fullName: "\\Public Studies\\GSE8581\\",
                                    key: "\\\\Public Studies\\Public Studies\\GSE8581\\",
                                    metadata: {
                                        Experiment: "exp2",
                                        Organism: "Homo sapiens",
                                        Status: "Public",
                                        Summary: "COPD Study",
                                        Title: "Human COPD"
                                    },
                                    name: "GSE8581",
                                    type: "STUDY"

                                }
                            }
                        },
                        type: "string",
                        boxId: boxId
                    }
                ];

                return labels;
            };

			return service;
		});

