'use strict';

describe('SidebarCtrl', function () {

    beforeEach(module('transmartBaseUi'));

    var ctrl, scope, rootScope, StudyListService;
    var dummyStudies = [
        {
            "hide": false,
            "id": "AV_APP_DEMO",
            "_links": {
                "self": {
                    "href": "/studies/av_app_demo"
                }
            },
            "_embedded": {
                "ontologyTerm": {
                    "name": "AV_APP_DEMO",
                    "key": "\\\\Public Studies\\Public Studies\\AV_APP_DEMO\\",
                    "fullName": "\\Public Studies\\AV_APP_DEMO\\",
                    "type": "STUDY",
                    "_links": {
                        "self": {
                            "href": "/studies/av_app_demo/concepts/ROOT"
                        },
                        "observations": {
                            "href": "/studies/av_app_demo/concepts/ROOT/observations"
                        },
                        "children": [
                            {
                                "href": "/studies/av_app_demo/concepts/Biomarker%20Data",
                                "title": "Biomarker Data"
                            },
                            {
                                "href": "/studies/av_app_demo/concepts/Samples%20and%20Timepoints",
                                "title": "Samples and Timepoints"
                            },
                            {
                                "href": "/studies/av_app_demo/concepts/Subjects",
                                "title": "Subjects"
                            }
                        ]
                    }
                }
            }
        },
        {
            "id": "GSE19429",
            "hide": false,
            "_links": {
                "self": {
                    "href": "/studies/gse19429"
                }
            },
            "_embedded": {
                "ontologyTerm": {
                    "name": "GSE19429",
                    "key": "\\\\Public Studies\\Public Studies\\GSE19429\\",
                    "fullName": "\\Public Studies\\GSE19429\\",
                    "type": "STUDY",
                    "metadata": {
                        "TITLE": "Expression data from bone marrow CD34+ cells of MDS patients and healthy controls",
                        "ORGANISM": "Homo Sapiens",
                        "Citation": "Pellagatti A, Cazzola M, Giagounidis A, Perry J et al. Deregulated gene expression pathways in myelodysplastic syndrome hematopoietic stem cells. Leukemia 2010 Apr;24(4):756-64.",
                        "Citation URL": "http://www.ncbi.nlm.nih.gov/pubmed/20220779",
                        "Data location": "http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE19429",
                        "Publication date": "March 13 2010",
                        "Full description": "183 patients with MDS patients and 17 healthy controls were included in the study. Bone marrow samples were obtained and CD34 cells isolated from MDS patients and healthy controls. Samples were hybridized to Affymetrix GeneChip Human Genome U133 Plus 2.0 arrays"
                    },
                    "_links": {
                        "self": {
                            "href": "/studies/gse19429/concepts/ROOT"
                        },
                        "observations": {
                            "href": "/studies/gse19429/concepts/ROOT/observations"
                        },
                        "children": [
                            {
                                "href": "/studies/gse19429/concepts/Demographics",
                                "title": "Demographics"
                            }
                        ]
                    }
                }
            }
        },
        {
            "id": "GSE8581",
            "hide": false,
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
                    "type": "STUDY",
                    "metadata": {
                        "Status": "Public on May 31, 2008",
                        "TITLE": "Human Chronic Obstructive Pulmonary Disorder (COPD) Biomarker",
                        "Organism": "Homo sapiens",
                        "Title": "Human Chronic Obstructive Pulmonary Disorder (COPD) biomarker",
                        "Summary": "Chronic obstructive pulmonary disease (COPD) is an inflammatory lung disease with complex pathological features and largely unknown etiologies. Identification and validation of biomarkers for this disease could facilitate earlier diagnosis, appreciation of disease subtypes and/or determination of response to therapeutic intervention. To identify gene expression markers for COPD, we performed genome-wide expression profiling of lung tissue from 56 subjects using the Affymetrix U133 Plus 2.0 array. Lung function measurements from these subjects ranged from normal, un-obstructed to severely obstructed. Analysis of differential expression between cases (FEV1<70%, FEV1/FVC<0.7) and controls (FEV1>80%, FEV1/FVC>0.7) ...... A total of 31 probe sets were identified that showed evidence of significant correlation with quantitative traits and differential expression between cases and controls. Keywords: Disease state marker"
                    },
                    "_links": {
                        "self": {
                            "href": "/studies/gse8581/concepts/ROOT"
                        },
                        "observations": {
                            "href": "/studies/gse8581/concepts/ROOT/observations"
                        },
                        "children": [
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
        }
    ];

    beforeEach(inject(function (_$controller_, _$rootScope_, _StudyListService_) {
        StudyListService = _StudyListService_;
        scope = _$rootScope_.$new();
        rootScope = _$rootScope_;
        ctrl = _$controller_('SidebarCtrl', {
            $scope: scope,
            $rootScope: rootScope
        });
        StudyListService.studyList = [];
    }));

    it('is should be defined', function () {
        expect(ctrl).not.toEqual(undefined);
    });

    it('should start with no studies loaded', function () {
        expect(ctrl.publicStudies.length).toEqual(0);
        expect(ctrl.privateStudies.length).toEqual(0);
    });

    describe('addSearchKey', function () {

        beforeEach(function () {
            StudyListService.studyList = [];
            StudyListService.studyList.push(dummyStudies[0]);
            StudyListService.studyList.push(dummyStudies[1]);
            StudyListService.studyList.push(dummyStudies[2]);
        });

        it('should add search key into searchKeys list and hide unmatched studies', function () {
            ctrl.searchTerm = 'ss';
            ctrl.searchKeys = [];
            ctrl.addSearchKey();
            expect(ctrl.searchKeys.length).toEqual(1);
            expect(ctrl.searchTerm).toEqual('');
            expect(StudyListService.studyList[0].hide).toBe(true);
        });

        it('should add case insensitive search key into searchKeys list and show matched studies', function () {
            ctrl.searchTerm = 'app';
            ctrl.searchKeys = [];
            ctrl.addSearchKey();
            expect(ctrl.searchKeys.length).toEqual(1);
            expect(ctrl.searchTerm).toEqual('');
            expect(StudyListService.studyList[0].hide).toBe(false);
        });

        it('should not add search key into searchKeys list if search key is empty and show all studies', function () {
            ctrl.searchTerm = '';
            ctrl.searchKeys = [];
            ctrl.addSearchKey();
            expect(ctrl.searchKeys.length).toEqual(0);
            expect(StudyListService.studyList[0].hide).toBe(false);
        });

        it('should not add search key into searchKeys list if search key already exists', function () {
            ctrl.searchTerm = 'a';
            ctrl.searchKeys = ['a'];
            ctrl.addSearchKey();
            expect(ctrl.searchKeys.length).toEqual(1);
        });

        it('should by default perform a OR-based search between two terms and show matched studies', function () {
            ctrl.searchKeys = ['av'];
            ctrl.searchTerm = 'GSE';
            ctrl.addSearchKey();

            expect(ctrl.searchKeys.length).toEqual(2);
            expect(ctrl.operator).toEqual('OR');
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
            expect(StudyListService.studyList[2].hide).toBe(false);
        });

        it('should by perform a AND-based search between two terms and show matched studies', function () {
            ctrl.searchKeys = ['av'];
            ctrl.searchTerm = 'GSE';
            ctrl.operator = 'AND';
            ctrl.addSearchKey();

            expect(ctrl.searchKeys.length).toEqual(2);
            expect(ctrl.operator).toEqual('AND');
            expect(StudyListService.studyList[0].hide).toBe(true);
            expect(StudyListService.studyList[1].hide).toBe(true);
            expect(StudyListService.studyList[2].hide).toBe(true);
        });
    });

    describe('removeAllSearchKeys', function () {

        beforeEach(function () {
            StudyListService.studyList = [];
            StudyListService.studyList.push(dummyStudies[0]);
            StudyListService.studyList.push(dummyStudies[1]);
            StudyListService.studyList.push(dummyStudies[2]);
        });

        it('should remove all search keys and display all studies', function () {
            ctrl.searchKeys = ['GSE', 'APP', 'XXX'];
            ctrl.removeAllSearchKeys();
            expect(ctrl.searchKeys.length).toEqual(0);
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
            expect(StudyListService.studyList[2].hide).toBe(false);
        });

    });

    describe('removeSearchKey', function () {

        beforeEach(function () {
            StudyListService.studyList = [];
            StudyListService.studyList.push(dummyStudies[1]);
            StudyListService.studyList.push(dummyStudies[2]);
        });

        it('should remove a search key', function () {
            ctrl.searchKeys = ['GSE', 'DDD', 'XXX'];
            ctrl.addSearchKey();
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
            ctrl.removeSearchKey('GSE');
            expect(ctrl.searchKeys.length).toEqual(2);
            expect(StudyListService.studyList[0].hide).toBe(true);
            expect(StudyListService.studyList[1].hide).toBe(true);
        });

        it('should remove all search key', function () {
            // reset visibility flag to show
            StudyListService.studyList.forEach(function (s) {
                s.hide = false;
            });

            ctrl.searchKeys = ['GSE'];
            ctrl.addSearchKey();
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
            ctrl.removeSearchKey('GSE');
            expect(ctrl.searchKeys.length).toEqual(0);
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
        });

    });


});
