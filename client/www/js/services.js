angular.module ('amblr.services', [])

.factory('POIs', function($http, $rootScope, ENV) {
  var POIs = {};

  POIs.getPOIs = function() {
    return $http.get(ENV.apiEndpoint + '/api/pois/')
    .then(function(pois) {
      return pois;
    })
    .catch(function(err) {
      console.log('error in getting pois in services.js: ', err);
    });
  };

  POIs.savePOI = function(POI) {
    return $http({
      method: 'POST',
      url: ENV.apiEndpoint + '/api/pois/',
      data: JSON.stringify(POI)
    }).then(function(res) {
      //both addPOIs run this
      $rootScope.$broadcast('reloadPOIs');
      return res;
    })
    .catch(function(err) {
      console.log('error in saving poi to databse', err);
    });
  };
  return POIs;
})

.factory('Routes', function($http, $rootScope, ENV) {
  var Routes = {};

  Routes.getRoutes = function() {
    console.log('in the Routes factory');
      return $http.get(ENV.apiEndpoint + '/api/routes/')
      .then(function(routes) {
        return routes;
      })
      .catch(function(err) {
        console.log('error in getting routes in services.js: ', err);
      });
    };
  return Routes;
})

.factory('Location', function($cordovaGeolocation, $ionicLoading) {

  var location = {};

  location.getCurrentPos = function() {
    var position = {};
    $ionicLoading.show({
      template: 'Getting current location...',
      noBackdrop: true
    });

    var options = {timeout: 10000, enableHighAccuracy: true};
    return $cordovaGeolocation.getCurrentPosition(options).then(function (pos) {
      position.lat = pos.coords.latitude;
      position.long = pos.coords.longitude;

      $ionicLoading.hide();
      return position;
    }, function (error) {
      alert('Unable to get location: ' + error.message);
      $ionicLoading.hide(); 
    });
  };

  return location;

})

.factory('CenterMap', function($rootScope) {

  var CenterMap = {};

  CenterMap.recenter = function() {
    $rootScope.$broadcast('centerMap');
    return true;
  };

  return CenterMap;
});

