angular.module('transmartBaseUi')
  .service('dataService',
  ['Restangular', function(Restangular){

    this.getSingleTree = function(study) {
      var tree = {};

      var parseFolder = function (path){
        var cur = tree,
          last = tree;
        var strPath = path;
        path = path.split('\\').slice(1,-1);

        while(path.length){
          var elem = path.shift();
          if (!cur.hasOwnProperty('title')) {
            cur['title'] = elem;
            // TODO: determine type from API answer
            if(path.length){
              cur['nodes'] = new Array({});
              cur = cur.nodes[0];
            } else {
              cur['link'] = strPath;
            }
          } else {
            if (cur['title'] == elem) {
              if(!cur.hasOwnProperty('nodes') && path.length) {
                cur['nodes'] = new Array({});
              }
              last = cur;
              cur = cur.nodes[cur.nodes.length-1]; // cont. traverse
            } else {
              // create new leaf and then push it
              var newNode = {};
              newNode['title'] = elem;
              if (!path.length) {
                newNode['link'] = strPath;
              }
              last.nodes.push(newNode);
              cur = newNode; // get latest item in nodes
            }
          }
        };
      }; //end parseFolder

      study.getList('concepts').then(function(concepts) {
        var paths = concepts.map(function(obj){
          return obj.fullName;
        });
        paths = paths.sort();
        // console.log(paths);

        for (var id in paths) {
          if (!isNaN(id)) {
            // console.log(concepts[id]);
            parseFolder(paths[id]);
          }
        }
        var setType = function (tree) {
          if (!tree.hasOwnProperty('nodes')){
            var t = ['NUMERICAL', 'CATEGORICAL', 'HIGH_DIMENSIONAL'];
            tree['type'] = t[Math.floor(Math.random()*t.length)];
          } else {
            tree['type'] = 'FOLDER';
            tree.nodes.forEach(function (node){
              setType(node);
            })
          }
        };
        setType(tree);

      });

      return tree;
    };
}]);
