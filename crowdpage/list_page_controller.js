var app = angular.module("myApp", ["ngRoute"]);
var host_name = "http://localhost:3000";

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "list_page.html",
        controller: 'listPageControler'
    })
    .when("/querylist/:query", {
      templateUrl: "single.html",
      controller: "singlePageController",
      css: 'style.css'
    })
});

app.controller('listPageControler',['$rootScope', '$scope', '$http', 'dataCollection', function($rootScope, $scope, $http, dataCollection) {
  $rootScope.query_list = []
  $rootScope.subjectivity_list = []
  var socket = io.connect();
  dataCollection.updateQueries()
  socket.on('query_display', function(obj) {
    dataCollection.updateQueries()
    console.log(obj);
    if (obj.length > 0) {
      for(var data in obj) {
        $rootScope.query_list.push(obj[data]['text'])
      }
    }
    $rootScope.$apply();
    console.log($rootScope.query_list);
  });
  socket.on('subjectives_display', function(msg){
    console.log(msg);
    if (msg.length > 0) {
      for(var data in msg) {
        $rootScope.subjectivity_list.push(msg[data]['text'])
      }
    }
  });
}])

app.controller('singlePageController',[ '$rootScope', '$scope', '$http', '$routeParams', 'dataCollection', function($rootScope, $scope, $http, $routeParams, dataCollection) {
  $scope.initialize = function(req) {

            $scope.request = req;
            $scope.request.isRecording = false;
            $scope.requestEditors = {};
            $scope.playRequestEditors = {};
            $scope.codeInline = [];
            $scope.answers = [];
            $scope.mostRecentAnswers = [];
            $scope.iterationMsg = "";
            $scope.chatbox_open = true;
            $scope.originalText = false
            $scope.historyLabel = "History"
            $scope.newAnswers = [];
            $scope.isAtCurrentResponse = false;
            $scope.newPullText
          }
  //
  // dataCollection.fetchRequest($routeParams.queryID).then(function(req) {
  //   $scope.initialize(req);
  // })



  $scope.query = $routeParams.query
  console.log($scope.query);
  var socket = io.connect();
  $scope.images = [1,2,3,4,5,6,7,8,9,10,11,12]

  $scope.save = function(ind) {
    console.log(ind);
    angular.element(document).find('#'+ind).css({ 'opacity': 0.5 });
  }
}])



app.factory('dataCollection', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){

  updateQueries()
  var requestPromises = {};
  $rootScope.query_list = [];
  function getJSON(url) {
      return $http({
          url: url
      }).then(function(response) {
          return response.data;
      });
  }

  function updateQueries() {
    getJSON(host_name + '/list_queries').then(function(queries) {
      console.log(queries);
        _.each(queries, function(updated, requestID) {
          requestPromises[requestID] = fetchRequest(requestID, updated);
        });

        $q.all(_.values(requestPromises)).then(function(content) {
            console.log(content);
              $rootScope.query_list = content.sort(function(a, b) {
                return b.updated - a.updated;
            });
        });

    });
  }

  function fetchRequest(requestID, updated){
    return $q(function(resolve, reject){
      getJSON(host_name + '/get_query/'+requestID).then(function(content){
        resolve(content);
      });
    });
  }

  return {
    // sendToTheCrowd: function(query){
    //   socket.emit('toCrowd', query);
    //   console.log(query);
    // },
    // sendToTellina: function(query){
    //   socket.emit('toTellina', query);
    // },
    updateQueries: function(query) {
      updateQueries();
    }
  }

}]);
