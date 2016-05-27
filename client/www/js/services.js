angular.module ('amblr.services', [])

.factory('POIs', function($http, $rootScope, ENV, $filter) {
  var POIs = {};
  POIs.inMemoryPOIs = [];

  POIs.routeFilter = null;

  POIs.getPOIs = function () {
    var self = this;
    
    return $http.get(ENV.apiEndpoint + '/api/pois/')
    .then(function (pois) {
      self.inMemoryPOIs = pois.data;
      
      /* filter POIs here for display */
      if (self.routeFilter) {
        /* filter and order by the route POIs order */
        pois.data = self.getRoutePOIs(self.routeFilter);
      }
      
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

  POIs.deletePOI = function(poiID) {
    var url = ENV.apiEndpoint + '/api/pois/' + poiID;
    return $http.delete(url, {})
              .success(function(data, status, headers, config) {
                // console.log('POI successfully deleted!');
              })
              .error(function(data, status, headers, config) {
                console.error('Error in deleting POI');
              });
  };

  POIs.setRouteFilter = function (routeID) {
    this.routeFilter = routeID;
  };

  POIs.getRoutePOIs = function (route) {
    /* filter and order by the route POIs order */
    return (route) ? this.inMemoryPOIs.reduce(function (accumulator, element) {
      var index = route.POIs.indexOf(element._id);
      if (index >= 0) {
        accumulator[index] = element;
      }
      return accumulator;
    }, []) : this.inMemoryPOIs;
  }

  return POIs;
})

.factory('Routes', function($http, $rootScope, ENV, uiGmapGoogleMapApi, uiGmapIsReady, POIs) {
  var Routes = {};
  var inMemoryRoutes = {};
  var directionsService = {};
  
  Routes.filterRoutesByDistance = function (coords) {
    return $http({
      method: 'POST',
      url: ENV.apiEndpoint + '/api/routes/',
      data: coords
    })
    .then(function(res) {
      return res;
    });
  };

  Routes.getRoutes = function () {
    var self = this;
    return $http.get(ENV.apiEndpoint + '/api/routes/')
      .then(function (routes) {
        return self.inMemoryRoutes = routes.data;
      })
      .catch(function (err) {
        console.log('error in getting routes in services.js: ', err);
      });
    };

  Routes.getRouteById = function(routeId) {
    // access inMemoryRoutes
    // 
    var routeById;
    this.inMemoryRoutes.forEach(function(route, index) {
      if(route._id === routeId) {
        routeById = route;
      }
    });
    return routeById;
  }

  Routes.getDirections = function(routeId) {
    // need to get the route object to use getRoutePOIs
    var routeObject = this.getRouteById(routeId);
    
    //get the POIs associated with this route
    var waypoints = POIs.getRoutePOIs(routeObject);

    // only want to show directions if there is more than one waypoint
    if (waypoints.length > 1 ) {
      var start = waypoints.splice(0,1);
      var end = waypoints.splice(waypoints.length -1 , 1);
      var waypointCoords = [];
      //splice above puts them into an array
      // taking them out so they are in a format we expect
      start = { lat:start[0]['lat'], lng: start[0]['long'] };
      end = { lat:end[0]['lat'], lng: end[0]['long'] };

      waypoints.forEach(function(waypoint, index) {
        var coords = { lat:waypoint['lat'], lng: waypoint['long'] };
        
        // format needed for waypoints in directions API:
        // https://developers.google.com/maps/documentation/javascript/directions#DirectionsRequests
        waypointCoords.push({location:coords, stopover: true});

      });

      //now we can create the directions
      uiGmapIsReady.promise()
      .then(function (instances) {        
        //for testing directions
        mapInstance = instances[0].map;

        uiGmapGoogleMapApi.then(function (maps) {
           $rootScope.directionsDisplay = new maps.DirectionsRenderer();
        });

      })
      .then(function() {
        directionsService = new google.maps.DirectionsService();
        var directionsRequest = {
          origin: start,
          destination: end,
          waypoints: waypointCoords,
          travelMode: google.maps.DirectionsTravelMode.WALKING,
          unitSystem: google.maps.UnitSystem.METRIC
        };

        directionsService.route(
          directionsRequest,
          function(response, status)
          {
            if (status == google.maps.DirectionsStatus.OK)
            {
             $rootScope.directionsDisplay.setMap(mapInstance);
             $rootScope.directionsDisplay.setOptions({ suppressMarkers: true});
             $rootScope.directionsDisplay.setDirections(response);
              
            }
            else
              console.log('there was an error', response);
          }
        );
      })
      .catch(function(err) {
        console.log('error in doing things when map is ready', err);
      });
    } else {
      // to do if there is only one or no POIs in a route
      var newCenter = {
        lat: routeObject.loc.coordinates[1],
        lng: routeObject.loc.coordinates[0]
      };

      $rootScope.$broadcast('recenterMap', {newCenter: newCenter});

    }
  };

  Routes.updateRoute = function (route) {
    return $http.put(ENV.apiEndpoint + '/api/routes/', route)
      .then(function (routes) {
        return routes.data;
      })
      .catch(function (err) {
        console.log('error in updating routes in services.js: ', err);
      });
  }; 

  Routes.clearDirections = function () {
    $rootScope.directionsDisplay && $rootScope.directionsDisplay.setMap(null);
  };

  Routes.deleteRoute = function (routeID) {
    var url = ENV.apiEndpoint + '/api/routes/' + routeID;
    return $http.delete(url, {})
      .success(function (data, status, headers, config) {
      })
      .error(function (data, status, headers, config) {
        console.error('Error in deleting route');
      });
  };
  
  return Routes;
})

.factory('User', function($http, $rootScope, ENV) {
  var User = {};

  User.getUserID = function() {
    return $http.get(ENV.apiEndpoint + '/checkuserid')
    .success(function(data) {
      console.log('UserID successfully retrieved: ', data);
      $rootScope.userID = data;
      return $rootScope.userID;
    })
    .error(function(data) {
      console.log('error: ' + data);
    });
  };

  return User;
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

