'use strict';


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



describe('SidebarCtrlTests', function() {
  beforeEach(module('transmartBaseUi'));

  var $controller, httpBackend, Restangular, scope, rootScope;

  beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_, _Restangular_) {
        httpBackend = _$httpBackend_;
        httpBackend.whenGET('http://localhost:8080/transmart-rest-api/studies').respond(emptyResponse);
        Restangular = _Restangular_;
        scope = _$rootScope_.$new();
        rootScope = _$rootScope_;
        $controller = _$controller_('SidebarCtrl', {
            $httpBackend: httpBackend,
            $scope: scope,
            $rootScope: rootScope,
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

    it('has no studies loaded', function() {
      expect(scope.publicStudies.length).toEqual(0);
      expect(scope.privateStudies.length).toEqual(0);
    });
  });

  describe('Adding a successful endpoint', function() {
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

    it('sets the endpoint to successful connection', function() {
      expect(scope.endpoints[0].status).toEqual('success');
      expect(scope.endpoints[1].status).toEqual('success');
    });

    it('has studies with HAL properties', function() {
      expect(scope.publicStudies[0]._embedded.ontologyTerm.name).not.toEqual(undefined);
    });

    it('has studies with endpoint attached', function() {
      expect(scope.publicStudies[0].endpoint).not.toEqual(undefined);
    });

    it('has studies as a Restangular object', function() {
      expect(scope.publicStudies[0].get).not.toEqual(undefined);
    });
  });

  describe('Adding a failing endpoint', function() {
    beforeEach(function(){
      scope.formData.url = 'www.mock.com';
      scope.formData.title = 'Mock';
      scope.formData.requestToken = null;
      scope.formData.endpointForm = {};
      scope.formData.endpointForm.$setPristine = function (){};
      httpBackend.expectGET('www.mock.com/studies').respond(500, '');
      scope.addResource();
      httpBackend.flush();
    });

    it('loads no studies', function() {
      expect(scope.publicStudies.length).toEqual(0);
      expect(scope.privateStudies.length).toEqual(0);
    });

    it('sets the endpoint to failed', function() {
      expect(scope.endpoints[1].status).toEqual('error');
    });
  });

  describe('Populating the form with a default API', function() {
    beforeEach(function(){
      scope.populateDefaultApi('whatitscalled', 'whereitgoes');
    });

    it('populates the form correctly', function() {
      expect(scope.formData.title ).toEqual('whatitscalled');
      expect(scope.formData.url).toEqual('whereitgoes');
      expect(scope.formData.requestToken).toEqual('');
    });
  });

  describe('Clearing the endpoints', function() {
    beforeEach(function(){
      rootScope.globals = {};
      rootScope.globals.currentUser = {};
      rootScope.globals.currentUser.authdata = ''
      scope.clearSavedEndpoints();
    });

    it('has not endpoints after clearing', function() {
      expect(scope.endpoints.length).toEqual(0);
    });
  });


});
