'use strict';

var emptyResponse = {
  "_links": {},
  "_embedded": {
    "studies": []
  }
};

var studyResponse = {
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
};

describe('SidebarCtrlTests', function() {
  beforeEach(module('transmartBaseUi'));

  var $controller, httpBackend, Restangular, scope;

  beforeEach(inject(function (_$controller_, _$httpBackend_, $rootScope, _Restangular_) {
        httpBackend = _$httpBackend_;
        httpBackend.whenGET('http://localhost:8080/transmart-rest-api/studies').respond(emptyResponse);
        Restangular = _Restangular_;
        scope = $rootScope.$new();
        $controller = _$controller_('SidebarCtrl', {
            $httpBackend: httpBackend,
            $scope: scope,
            Restangular: Restangular
          });
        httpBackend.flush();
      }));
  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('OnStartup', function() {
    it('is defined', function() {
      expect($controller).not.toEqual(undefined);
    });

    it('to have no studies loaded', function() {
      expect(scope.publicStudies.length).toEqual(0);
      expect(scope.privateStudies.length).toEqual(0);
    });
  });

  describe('AddEndpoint', function() {
    beforeEach(function(){
      scope.formData.url = 'www.mock.com';
      scope.formData.title = 'Mock';
      scope.formData.requestToken = null;
      scope.formData.endpointForm = {};
      scope.formData.endpointForm.$setPristine = function (){};
      httpBackend.expectGET('www.mock.com/studies').respond(studyResponse);
      scope.addResource();
      httpBackend.flush();
    });

    it('loads some studies', function() {
      expect(scope.publicStudies.length).toEqual(3);
      expect(scope.privateStudies.length).toEqual(1);
    });
  });



});
