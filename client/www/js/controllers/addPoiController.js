angular.module('amblr.addPOI', [])
.controller('addPOIController', function($scope, $timeout, $http, $rootScope, $ionicModal, POIs, $location, $ionicPopup, Location, Routes, ENV) {

  // a boolean to show or hide the 'Add new route' text field;
  $scope.addNewRoute = false;

  //a boolean to show or hide the route list (controlled by clicking on add to route button)
  $scope.showRouteList = false;
  
  $scope.handleNewRoute = function(state) {
    //state sets whether or not to show the new route text box
    $scope.addNewRoute = state;
  }

  $scope.showRoutes = function() {
    $scope.showRouteList = !$scope.showRouteList;
    if(!$scope.showRouteList) {
      $scope.addNewRoute = false;
      $scope.currentPOI.route = null;
    } 
    if(Routes.inMemoryRoutes.length > 0){
      // if there are some in memory routes, set the default route to the first in the list
      $scope.currentPOI.route = Routes.inMemoryRoutes[0]['name'];
    }
  }

  $ionicModal.fromTemplateUrl('../../templates/addPOI.html', {
    scope: $scope,
    animation: 'slide-in-up',
    // backdropClickToClose: true,
    // hardwareBackButtonClose: true
  })
  .then(function(modal) {
    $scope.modal = modal;
  });

  $scope.userID = null;

  $scope.getUserID = function() {
    $http.get(ENV.apiEndpoint + '/checkuserid')
    .success(function(data) {
      $rootScope.userID = data;
    })
    .error(function(data) {
      console.log('error: ' + data);
    });
  };

  //current POI is an object with properties: lat, long, type, description, title, route
  //set default of type to good
  $scope.selected = 'good';
  $scope.currentPOI = { 
    type: 'good'};

  //save POI upon user save
  $scope.savePOI = function() {
    //post currentPOI to the database
    POIs.savePOI($scope.currentPOI)
    .then(function(poi) {
      //clear out currentPOI
      $scope.poiSaved = poi;
      $scope.currentPOI = {type: 'good', route: null};
      $scope.addNewRoute = false;
      $scope.closeForm();
      // redirect to home page (may not need this)
      $scope.onSuccess();
      $location.path('/menu/home');
    })
    .catch(function(err) {
      console.log('error in saving poi to database', err);
      $scope.onError();
    });
  };


  $scope.onError = function() {
    $ionicPopup.alert({
      title: 'Oops there as was Problem :(',
      template: 'Would you like to try again?',
      buttons: [
      { text: 'Cancel'},
      { text: 'Try Again',
        type: 'button-dark',
        onTap: function(e) {
          $scope.openForm(); 
        }
      }]
    });
  };

  $scope.onSuccess = function() {
    $ionicPopup.alert({
      title: 'POI Saved!',
      template: 'Yay! You\'ve successfully added a POI to amblr!'
    });
  };

  $scope.cancelPOI = function() {
    $scope.currentPOI = { type: 'good', route: null};
    $scope.closeForm();
    $location.path('/menu/home');
  };

  $scope.openForm = function() {

    $scope.getUserID();
    $scope.allRoutes = {};

    //get current position from Location factory
    Routes.getRoutes()
    .then(function(routes) {
      //routes returns an array of objects. 
      //Need to loop through and create an object with the id as keys for easy look up to add to markers
      for (var route of routes) {
        //make key of allRoutes equal to the route's id and the value equal to the name
        $scope.allRoutes[route._id] = route.name;
      }
      return $scope.allRoutes;
    })
    .then(function() {
      return Location.getCurrentPos();
    })
    .then(function(pos) {
      $scope.currentPOI.lat = pos.lat;
      $scope.currentPOI.long = pos.long;
      $scope.currentPOI.userID = $rootScope.userID;
      $scope.currentPOI.route = null;
      //once position is found, open up modal form
      $scope.modal.show();
    })
    .catch(function(err) {
      console.log('error in getting current pos', err);
      $ionicPopup.alert({
        title: 'Error in getting current location',
        template: 'Please Try again later'
      });
      $location.path('/menu/home');
    });
    //returns a promise which is resolved when modal is finished animating in.
  };

  //close POI form
  $scope.closeForm = function() {
    $scope.currentPOI.route = null;
    $scope.addToRoute = false;
    $scope.modal.hide();
  };
  //toggles View of modal form depending on state
  $scope.toggleView = function() {
    if ($scope.modal.isShown()) {
      $scope.closeForm();
    } else {
      $scope.openForm();
    }
  };
  //clean up modal when done
  $scope.$on('$destroy', function() {
    $scope.modal.hide();
  });

});
