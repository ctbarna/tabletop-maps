$(function () {
  var loadEverything = function (data) {
    // Map Stuff
    var options = {
      center: new google.maps.LatLng(-34, 150),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Our map elements.
    var map = new google.maps.Map(document.getElementById("map"), options);
    var heatmap = new google.maps.Map(document.getElementById("heatmap"), options);
    var geocoder = new google.maps.Geocoder();
    var mapBounds = new google.maps.LatLngBounds();
    var infoWindow = new google.maps.InfoWindow({content: ''});

    var markers = [];
    var points = [];
    for (var i = 0; i < data.length; i += 1) {
      (function () {
        var element = data[i];

        // Generate the info string.
        var infoString = '<ul class="infoWindow">';
        for (var key in element) {
          infoString += '<li><strong>' + key + ':</strong> ' + element[key] + '</li>';
        }
        infoString += '</ul>';

        var generateMarker = function (position) {
          // Generate the marker.
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            content: infoString
          });
          markers.push(marker);

          // Attach the infoWindow event.
          google.maps.event.addListener(markers[markers.length-1], 'click', function () {
            infoWindow.setContent(this.content);
            infoWindow.open(map, this);
          });

          // Extend the boundaries of the map.
          mapBounds.extend(position);
          map.fitBounds(mapBounds);
        }


        // Geocode the points.
        if ('lat' in element && 'lng' in element) {
          var point = new google.maps.LatLng(element.lat, element.lng);
          points.push(point);

          for (var j = 0; j < points.length; j += 1) {
            mapBounds.extend(point);
            heatmap.fitBounds(mapBounds);
          }

          generateMarker(point);
        } else if ('location' in element) {
          geocoder.geocode({address: element.location }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              generateMarker(results[0].geometry.location);
            } else {
              console.log("Could not geocode: " + element.location);
            }
          });
        }
      })();
    }
    var heatmapLayer = new google.maps.visualization.HeatmapLayer({
      data: points,
      map: heatmap
    });
  };

  var tabletop = Tabletop.init({
    key: '0AhVZCkLOvRN4dGFVZkRCR05fdE1IektMSTdnZUJmWWc',
    callback: loadEverything,
    simpleSheet: true,
    postProcess: function (data) {
      delete data['rowNumber']
    }
  });

});
