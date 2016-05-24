'use strict';
/* jshint undef: false */

describe('StudyListService Unit Tests', function() {

  var StudyListService, EndpointService, httpBackend;

  var emptyResponse = {
    /* jshint ignore:start */
    "_links": {},
    "_embedded": {
      "studies": []
    }
    /* jshint ignore:end */
  };

  var studyResponse = {
    /* jshint ignore:start */
    "_links": {
    },
    "_embedded": {
      "studies":
        [
          {
            "id": "CELL-LINE",
            "_links": {
              "self": {
                "href": "/studies/cell-line"
              }
            },
            "_embedded": {
              "ontologyTerm": {
                "name": "Cell-line",
                "key": "\\\\Private Studies\\Private Studies\\Cell-line\\",
                "fullName": "\\Private Studies\\Cell-line\\",
                "_links": {
                  "self": {
                    "href": "/studies/cell-line/concepts/ROOT"
                  },
                  "observations": {
                    "href": "/studies/cell-line/concepts/ROOT/observations"
                  },
                  "children":
                    [
                      {
                        "href": "/studies/cell-line/concepts/Biomarker%20Data",
                        "title": "Biomarker Data"
                      },
                      {
                        "href": "/studies/cell-line/concepts/Characteristics",
                        "title": "Characteristics"
                      }
                    ]
                }
              }
            }
          },
          {
            "id": "GSE15258",
            "_links": {
              "self": {
                "href": "/studies/gse15258"
              }
            },
            "_embedded": {
              "ontologyTerm": {
                "name": "GSE15258",
                "key": "\\\\Public Studies\\Public Studies\\GSE15258\\",
                "fullName": "\\Public Studies\\GSE15258\\",
                "_links": {
                  "self": {
                    "href": "/studies/gse15258/concepts/ROOT"
                  },
                  "observations": {
                    "href": "/studies/gse15258/concepts/ROOT/observations"
                  },
                  "children":
                    [
                      {
                        "href": "/studies/gse15258/concepts/Biomarker%20Data",
                        "title": "Biomarker Data"
                      },
                      {
                        "href": "/studies/gse15258/concepts/Clinical%20Data",
                        "title": "Clinical Data"
                      },
                      {
                        "href": "/studies/gse15258/concepts/Samples%20and%20Timepoints",
                        "title": "Samples and Timepoints"
                      },
                      {
                        "href": "/studies/gse15258/concepts/STUDY%20ID",
                        "title": "STUDY ID"
                      },
                      {
                        "href": "/studies/gse15258/concepts/Subjects",
                        "title": "Subjects"
                      },
                      {
                        "href": "/studies/gse15258/concepts/Treatment%20Groups",
                        "title": "Treatment Groups"
                      }
                    ]
                }
              }
            }
          },
          {
            "id": "GSE8581",
            "_links": {
              "self": {
                "href": "/studies/gse8581"
              }
            },
            "_embedded": {
              "ontologyTerm": {
                "name": "GSE8581",
                "key": "\\\\Public Studies\\Public Studies\\GSE8581\\",
                "fullName": "\\Public Studies\\GSE8581\\",
                "_links": {
                  "self": {
                    "href": "/studies/gse8581/concepts/ROOT"
                  },
                  "observations": {
                    "href": "/studies/gse8581/concepts/ROOT/observations"
                  },
                  "children":
                    [
                      {
                        "href": "/studies/gse8581/concepts/Biomarker%20Data",
                        "title": "Biomarker Data"
                      },
                      {
                        "href": "/studies/gse8581/concepts/Endpoints",
                        "title": "Endpoints"
                      },
                      {
                        "href": "/studies/gse8581/concepts/Subjects",
                        "title": "Subjects"
                      }
                    ]
                }
              }
            }
          },
          {
            "id": "GSE17755",
            "_links": {
              "self": {
                "href": "/studies/gse17755"
              }
            },
            "_embedded": {
              "ontologyTerm": {
                "name": "GSE17755",
                "key": "\\\\Public Studies\\Public Studies\\GSE17755\\",
                "fullName": "\\Public Studies\\GSE17755\\",
                "_links": {
                  "self": {
                    "href": "/studies/gse17755/concepts/ROOT"
                  },
                  "observations": {
                    "href": "/studies/gse17755/concepts/ROOT/observations"
                  },
                  "children":
                    [
                      {
                        "href": "/studies/gse17755/concepts/Samples%20and%20Timepoints",
                        "title": "Samples and Timepoints"
                      },
                      {
                        "href": "/studies/gse17755/concepts/Study%20Groups",
                        "title": "Study Groups"
                      },
                      {
                        "href": "/studies/gse17755/concepts/STUDY%20ID",
                        "title": "STUDY ID"
                      },
                      {
                        "href": "/studies/gse17755/concepts/Subjects",
                        "title": "Subjects"
                      }
                    ]
                }
              }
            }
          }
        ]
    }
    /* jshint ignore:end */
  };

  beforeEach(function() {module('transmartBaseUi');});

  beforeEach(inject(function (_StudyListService_, _EndpointService_, _$httpBackend_) {
    httpBackend = _$httpBackend_;
    httpBackend.whenGET('http://localhost:8080/transmart-rest-api/studies').respond(emptyResponse);
    StudyListService = _StudyListService_;
    EndpointService = _EndpointService_;
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });


  it('should have StudyListService defined', function () {
    expect(StudyListService).toBeDefined();
    expect(StudyListService.studyList).toBeDefined();
  });

  it('should start with empty studies', function () {
    expect(StudyListService.studyList.length).toEqual(0);
  });

  it('should empty studies', function () {
    StudyListService.studyList = ['1', '2', '3'];
    StudyListService.emptyAll();
    expect(StudyListService.studyList.length).toEqual(0);
  });

  it('should get all studies', function () {
    StudyListService.studyList = [
      {id:1, type:'public'},
      {id:2, type:'private'},
      {id:3, type:'public'},
      {id:4, type:'private'},
      {id:5, type:'public'},
      {id:6, type:'public'}
    ];
    var _all = StudyListService.getAll();
    expect(_all.length).toEqual(6);
  });

});
