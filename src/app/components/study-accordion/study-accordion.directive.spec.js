'use strict';
describe('studyAccordion', function () {
    var scope, template, controller, TreeNodeService, $q;

    beforeEach(function () {
        module('transmartBaseUi');
    });

    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    beforeEach(inject(function ($compile, $rootScope, $controller, _TreeNodeService_, _$q_) {
        scope = $rootScope.$new();
        $q = _$q_;
        TreeNodeService = _TreeNodeService_;

        var element = angular.element("<study-accordion></study-accordion>");
        template = $compile(element)(scope);
        scope.$digest();

        controller = $controller('StudyAccordionCtrl', {$scope: scope});
    }));

    describe('$scope.populateChildren', function () {
        var _scope, deferred, _n;

        beforeEach(function () {
            _scope = scope;
            deferred = $q.defer();

            _n = {
                title: 'someTitle',
                total: 999,
                type: 'UNKNOWN',
                isLoading: false
            };

            spyOn(TreeNodeService, 'setRootNodeAttributes').and.returnValue(_n);
            spyOn(TreeNodeService, 'getNodeChildren').and.returnValue(deferred.promise);
            spyOn(_scope, 'clearMetadata');
        });

        it('should invoke TreeNodeService.getNodeChildren when populating node children', function () {
            _scope.populateChildren({});
            expect(TreeNodeService.setRootNodeAttributes).toHaveBeenCalled();
            expect(TreeNodeService.getNodeChildren).toHaveBeenCalled();
        });

        it('should not invoke TreeNodeService.setRootNodeAttributes when populating study node', function () {
            _scope.populateChildren({restObj:'foo'});
            expect(TreeNodeService.setRootNodeAttributes).not.toHaveBeenCalled();
            expect(TreeNodeService.getNodeChildren).toHaveBeenCalled();
        });

    });

    describe('$scope.clearMetadata', function () {
        var _scope, _nodes = [
            {
                $$hashKey: 'object:001',
                _embedded: {
                    ontologyTerm: {
                        name: '_embedded-name-1',
                        fullName: '_embedded-fullname-1',
                        metadata: '_embedded-metadata-1'
                    }
                }
            },
            {
                $$hashKey: 'object:002',
                _embedded: {
                    ontologyTerm: {
                        name: '_embedded-name-2',
                        fullName: '_embedded-fullname-2',
                        metadata: '_embedded-metadata-2'
                    }
                }
            }
        ];

        beforeEach(function () {
            _scope = scope;
            _scope.prev_node = _nodes[0];
        });

        it('should recognize it is the same node as the previous one, and the popover selection is empty', function () {
            var result = _scope.clearMetadata(_nodes[0]);
            expect(result.isSame).toEqual(true);
            expect(result.popover.length).toEqual(0);
        });

        it('should recognize it is a different node from the previous one, and the popover selection is empty', function () {
            var result = _scope.clearMetadata(_nodes[1]);
            expect(result.isSame).toEqual(false);
            expect(result.popover.length).toEqual(0);
        });

    });

    describe('$scope.displayMetadata', function () {
        var _scope, _nodes = [
            {restObj: {fullName: 'restObj-fullname', metadata: 'restObj-metadata'}, title: 'restObj-title'},
            {
                _embedded: {
                    ontologyTerm: {
                        name: '_embedded-name',
                        fullName: '_embedded-fullname',
                        metadata: '_embedded-metadata'
                    }
                }
            }
        ];

        beforeEach(function () {
            _scope = scope;
            _scope.metadataObj = {};
        });

        it('should use metadata from restObj when node has restObj property', function () {
            _scope.displayMetadata(_nodes[0]);
            expect(_scope.metadataObj.title).toEqual('restObj-title');
            expect(_scope.metadataObj.fullname).toEqual('restObj-fullname');
            expect(_scope.metadataObj.body).toEqual('restObj-metadata');
        });

        it('should use metadata from embedded.ontologyTerm when node has _embedded property', function () {
            _scope.displayMetadata(_nodes[1]);
            expect(_scope.metadataObj.title).toEqual('_embedded-name');
            expect(_scope.metadataObj.fullname).toEqual('_embedded-fullname');
            expect(_scope.metadataObj.body).toEqual('_embedded-metadata');
        });

        it('should invoke $scope.clearMetadata when $scope.displayMetadata is called', function () {
            spyOn(_scope, 'displayMetadata').and.callThrough();
            spyOn(_scope, 'clearMetadata');
            _scope.displayMetadata(_nodes[0]);
            expect(_scope.displayMetadata).toHaveBeenCalled();
            expect(_scope.clearMetadata).toHaveBeenCalled();
        });

        it('should not invoke  $scope.displayMetadata when node is null or undefined', function () {
            spyOn(_scope, 'displayMetadata').and.callThrough();
            spyOn(_scope, 'clearMetadata');
            _scope.displayMetadata(null);
            expect(_scope.clearMetadata).not.toHaveBeenCalled();

            _scope.displayMetadata(undefined);
            expect(_scope.clearMetadata).not.toHaveBeenCalled();
        });

    });


});
