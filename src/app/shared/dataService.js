angular.module('transmartBaseUi')
  .service('dataService',
  ['Restangular', function(Restangular){
    this.studies = {
      areLoaded: false,
      studies: [],
      tree: {},

      reload: function (){
        Restangular.all('studies').getList()
          .then(function (studies) {

            var buildTree = function (study) {
              var files={};
              this.tree = {};

              var parseFolder = function (path){
                var cur = files,
                  last = files;
                path = path.split("\\").slice(1,-1);

                while(path.length){
                  var elem = path.shift();
                  if (!cur.hasOwnProperty("title")) {
                    cur["title"] = elem;
                    if(path.length){
                      cur["nodes"] = new Array({});
                      cur = cur.nodes[0];
                    }
                  } else {
                    if (cur["title"] == elem) {
                      if(!cur.hasOwnProperty("nodes") && path.length) {
                        cur["nodes"] = new Array({});
                      }
                      last = cur;
                      cur = cur.nodes[cur.nodes.length-1]; // cont. traverse
                    } else {
                      // create new leaf and then push it
                      var newNode = {};
                      newNode["title"] = elem;
                      last.nodes.push(newNode);
                      cur = newNode; // get latest item in nodes
                    }
                  }
                };
              }; //end parseFolder

              study.getList("concepts").then(function(concepts) {
                var paths = concepts.map(function(obj){
                  return obj.fullName;
                })
                paths = paths.sort();

                for (var id in paths) {
                  if (!isNaN(id)) {
                    // console.log(concepts[id]);
                    parseFolder(paths[id]);
                  }
                }
              });

              this.tree.push(files);

            }; //end of build tree

            // alert user that it successfully connects to the rest-api
            //$scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});

            studies.forEach(function (study) {
              buildTree(study);
            });

            this.studies = studies;

          }, function (err) {
            // alert user that system cannot talk to the rest-api
            //$scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
            console.error(err);
          });
      },
      getTree: function(){
        if(!this.areLoaded) this.reload();
        return this.tree;
      },
      getStudies: function(){
        if(!this.areLoaded) this.reload();
        return this.studies;
      }
    };
}]);
