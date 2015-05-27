angular.module('transmartBaseUi')
  .service('dataService',
  ['Restangular', function(Restangular){

    var stud = [];

    Restangular.all('studies').getList()
      .then(function (studies) {

        // alert user that it successfully connects to the rest-api
        //$scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});

        stud = studies;


      }, function (err) {
        // alert user that system cannot talk to the rest-api
        //$scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
        console.error(err);
      });


    this.getStudies = function(){
        return stud;
    };

    this.getSingleTree = function(study) {
      var tree = {};

      var parseFolder = function (path){
        var cur = tree,
          last = tree;
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

      console.log(tree);
      return tree;
    };
}]);
