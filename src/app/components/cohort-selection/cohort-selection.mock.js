'use strict';
/**
 * @Service CohortSelectionMocks
 * @Description Service layer exposing mocks for gridster and cohort charts
 */
angular.module('transmartBaseUi')
    .factory('CohortSelectionMocks',
        function () {
            var service = {};

            /*
             * Mocked labels' ids
             * (all labels are in the same box, i.e. cohort-selection panel):
             * gender: 0
             * length: 1
             * genderLength (combination): 2
             * race: 3
             * genderRace (combination): 4,
             * age: 5,
             * lengthAge: 6
             */

            service.getGridsterOptions = function () {
                var options = {
                    // whether to push other items out of the way on move or resize
                    pushing: true,
                    /*
                     * floating: whether to automatically float items up so they stack --
                     * this option, if set to true, will alleviate the problem where
                     * dragging one item pushes the others away and produces wasted empty spaces
                     */
                    floating: true,
                    // whether or not to have items of the same size switch places instead
                    // of pushing down if they are the same size
                    swapping: true,
                    // the pixel distance between each widget
                    margins: [10, 10],
                    // whether margins apply to outer edges of the grid
                    outerMargin: false,
                    // the minimum columns the grid must have
                    minColumns: 1,
                    // the minimum height of the grid, in rows
                    minRows: 1,
                    // maximum number of rows
                    maxRows: 100,
                    // minimum column width of an item
                    minSizeX: 2,
                    // maximum column width of an item
                    maxSizeX: null,
                    // minumum row height of an item
                    minSizeY: 2,
                    // maximum row height of an item
                    maxSizeY: null,
                    resizable: {
                        enabled: true,
                        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
                        resize: function (event, $element, widget) {
                            // Resize chart container in an interactive way
                            angular.element('#cohort-chart-panel-' + widget.ids)
                                .width($element[0].clientWidth)
                                .height($element[0].clientHeight);
                        }
                    },
                    draggable: {
                        enabled: true, // whether dragging items is supported
                        handle: '.chart-drag-handle' // optional selector for resize handle
                    }
                };

                return options;
            };

            service.getGridsterItem = function () {
                var gridsterItem = {
                    col: 0,
                    row: 0,
                    minSizeX: 0,
                    minSizeY: 0,
                    maxSizeX: 50,
                    maxSizeY: 50,
                    oldColumn: 0,
                    oldRow: 0,
                    oldSizeX: 3,
                    oldSizeY: 3
                };

                return gridsterItem;
            };

            service.getGridster = function () {
                var gridster = {
                    curColWidth: 89,
                    curRowHeight: 89,
                    curWidth: 1050,
                    colWidth: 'auto',
                    rowHeight: 'match'
                };

                return gridster;
            };

            service.getSubjects = function () {
                var subject1 = {
                    id: 1,
                    gender: 'male',
                    length: 181,
                    race: 'asian',
                    age: 30.2
                };
                var subject2 = {
                    id: 2,
                    gender: 'female',
                    length: 182,
                    race: 'white',
                    age: 40
                };
                var subject3 = {
                    id: 3,
                    gender: 'unknown',
                    length: 183,
                    race: 'black',
                    age: 50
                };
                return [subject1, subject2, subject3];
            };

            service.getGenderLabel = function () {
                var boxId = 'testBoxId';
                var box = {
                    boxId: boxId,
                    checked: true,
                    index: 0
                };
                var conceptPath = 'a/concept/path/gender';
                var label = {
                    box: box,
                    boxId: boxId,
                    col: 0,
                    row: 0,
                    sizeX: 1,
                    sizeY: 1,
                    conceptPath: conceptPath,
                    filters: undefined,
                    label: conceptPath,
                    labelId: 0,
                    name: 'gender',
                    type: 'string'
                };
                return label;
            };

            service.getRaceLabel = function () {
                var boxId = 'testBoxId';
                var box = {
                    boxId: boxId,
                    checked: true,
                    index: 0
                };
                var conceptPath = 'a/concept/path/race';
                var label = {
                    box: box,
                    boxId: boxId,
                    col: 0,
                    row: 0,
                    sizeX: 1,
                    sizeY: 1,
                    conceptPath: conceptPath,
                    filters: undefined,
                    label: conceptPath,
                    labelId: 3,
                    name: 'race',
                    type: 'string'
                };
                return label;
            };

            service.getLengthLabel = function () {
                var boxId = 'testBoxId';
                var box = {
                    boxId: boxId,
                    checked: true,
                    index: 0
                };
                var conceptPathLength = 'a/concept/path/length';
                var label = {
                    box: box,
                    boxId: boxId,
                    col: 1,
                    row: 0,
                    sizeX: 1,
                    sizeY: 1,
                    conceptPath: conceptPathLength,
                    filters: undefined,
                    label: conceptPathLength,
                    labelId: 1,
                    name: 'length',
                    type: 'number'
                }
                return label;
            };

            service.getAgeLabel = function () {
                var boxId = 'testBoxId';
                var box = {
                    boxId: boxId,
                    checked: true,
                    index: 0
                };
                var conceptPath = 'a/concept/path/age';
                var label = {
                    box: box,
                    boxId: boxId,
                    col: 4,
                    row: 0,
                    sizeX: 1,
                    sizeY: 1,
                    conceptPath: conceptPath,
                    filters: undefined,
                    label: conceptPath,
                    labelId: 1,
                    name: 'age',
                    type: 'number'
                }
                return label;
            };

            service.getGenderLengthLabel = function () {
                var genderLabel = service.getGenderLabel();
                var lengthLabel = service.getLengthLabel();
                var combiLabel = {
                    box: genderLabel.box,
                    boxId: genderLabel.boxId,
                    row: 0,
                    col: 2,
                    sizeX: 1,
                    sizeY: 1,
                    filters: undefined,
                    labelId: 2,
                    labels: [genderLabel, lengthLabel],
                    name: 'gender - length',
                    type: 'combination'
                };
                return combiLabel;
            };

            service.getGenderRaceLabel = function () {
                var genderLabel = service.getGenderLabel();
                var raceLabel = service.getRaceLabel();
                var combiLabel = {
                    box: genderLabel.box,
                    boxId: genderLabel.boxId,
                    row: 0,
                    col: 3,
                    sizeX: 1,
                    sizeY: 1,
                    filters: undefined,
                    labelId: 4,
                    labels: [genderLabel, raceLabel],
                    name: 'gender - race',
                    type: 'combination'
                };
                return combiLabel;
            };

            service.getLengthAgeLabel = function () {
                var lengthLabel = service.getLengthLabel();
                var ageLabel = service.getAgeLabel();

                var combiLabel = {
                    box: lengthLabel.box,
                    boxId: lengthLabel.boxId,
                    row: 0,
                    col: 6,
                    sizeX: 1,
                    sizeY: 1,
                    filters: undefined,
                    labelId: 6,
                    labels: [lengthLabel, ageLabel],
                    name: 'length - age',
                    type: 'combination'
                };
                return combiLabel;
            };

            service.getGenderNode = function () {
                var subjects = service.getSubjects();
                var conceptPathGender = 'a/concept/path/gender';
                var observationsGender = [];
                subjects.forEach(function (_subject) {
                    observationsGender.push({
                        _embedded: {
                            subject: _subject
                        },
                        label: conceptPathGender,
                        value: _subject.gender
                    });
                });
                var restObjGender = {
                    fullName: conceptPathGender,
                    name: 'gender'
                };
                var nodeGender = {};
                var labelGender = service.getGenderLabel();
                labelGender.node = nodeGender;
                nodeGender.label = labelGender;
                nodeGender.observations = observationsGender;
                nodeGender.restObj = restObjGender;
                nodeGender.title = 'gender';
                nodeGender.total = subjects.length;
                nodeGender.type = 'CATEGORICAL_CONTAINER';

                var maleNode = {
                    title: 'male',
                    total: 1,
                    type: 'CATEGORICAL_OPTION'
                };

                var femaleNode = {
                    title: 'female',
                    total: 1,
                    type: 'CATEGORICAL_OPTION'
                };
                nodeGender.nodes = [maleNode, femaleNode];

                return nodeGender;
            };

            service.getGenderLeafNode = function () {
                var parentNode = service.getGenderNode();
                var conceptPath = 'a/concept/path/gender/male/';
                var restObj = {
                    fullName: conceptPath,
                    name: 'gender'
                };
                var node = {
                    label: undefined,
                    loaded: false,
                    nodes: [],
                    parent: parentNode,
                    restObj: restObj,
                    title: 'male',
                    total: 1,
                    type: 'CATEGORICAL_OPTION'
                };

                return node;
            };

            service.getLengthNode = function () {
                var subjects = service.getSubjects();
                var conceptPathLength = 'a/concept/path/length';
                var observationsLength = [];
                subjects.forEach(function (_subject) {
                    observationsLength.push({
                        _embedded: {
                            subject: _subject
                        },
                        label: conceptPathLength,
                        value: _subject.gender
                    });
                });
                var restObjLength = {
                    _links: {
                        children: undefined
                    },
                    fullName: conceptPathLength,
                    name: 'length'
                };
                var nodeLength = {};
                var labelLength = service.getLengthLabel();
                labelLength.node = nodeLength;
                nodeLength.label = labelLength;
                nodeLength.observations = observationsLength;
                nodeLength.restObj = restObjLength;
                nodeLength.title = 'length';
                nodeLength.total = subjects.length;
                nodeLength.type = 'NUMERIC';
                nodeLength.nodes = [];
                return nodeLength;
            };

            service.getRaceNode = function () {
                var subjects = service.getSubjects();
                var conceptPath = 'a/concept/path/race';
                var observations = [];
                subjects.forEach(function (_subject) {
                    observations.push({
                        _embedded: {
                            subject: _subject
                        },
                        label: conceptPath,
                        value: _subject.race
                    });
                });
                var restObj = {
                    fullName: conceptPath,
                    name: 'race'
                };
                var node = {};
                var label = service.getRaceLabel();
                label.node = node;
                node.label = label;
                node.observations = observations;
                node.restObj = restObj;
                node.title = 'race';
                node.total = subjects.length;
                node.type = 'CATEGORICAL_CONTAINER';

                var asianNode = {
                    title: 'asian',
                    total: 1,
                    type: 'CATEGORICAL_OPTION'
                };

                var whiteNode = {
                    title: 'white',
                    total: 1,
                    type: 'CATEGORICAL_OPTION'
                };

                var blackNode = {
                    title: 'black',
                    total: 1,
                    type: 'CATEGORICAL_OPTION'
                };

                node.nodes = [asianNode, whiteNode, blackNode];

                return node;
            };

            service.getAgeNode = function () {
                var subjects = service.getSubjects();
                var conceptPath = 'a/concept/path/age';
                var observations = [];
                subjects.forEach(function (_subject) {
                    observations.push({
                        _embedded: {
                            subject: _subject
                        },
                        label: conceptPath,
                        value: _subject.age
                    });
                });
                var restObj = {
                    _links: {
                        children: undefined
                    },
                    fullName: conceptPath,
                    name: 'age'
                };
                var node = {};
                var label = service.getAgeLabel();
                label.node = node;
                node.label = label;
                node.observations = observations;
                node.restObj = restObj;
                node.title = 'age';
                node.total = subjects.length;
                node.type = 'NUMERIC';
                node.nodes = [];
                return node;
            };

            return service;
        });
