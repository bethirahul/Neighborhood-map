function make_url(url, parameters={})
{
    parameters_length = Object.keys(parameters).length;
    if(parameters_length > 0)
    {
        url += '?';
        k = 0;
        for(key in parameters)
        {
            value = parameters[key];
            if(value.constructor === Array)
            {
                url += key + '=' + value[0];
                for(var i=1; i<value.length; i++)
                    url += "," + value[i];
            }
            else
                url += key + '=' + value;
            if(k < parameters_length-1)
                url += '&';
            k++;
        }
    }

    return url;
}

(function()
{
    var url = "https://maps.googleapis.com/maps/api/js";
    var parameters = {
        'key': 'AIzaSyCxJAircwo3jIDVpKa2WCDz86mdtX-YOng',
        'libraries': ['geometry', 'drawing', 'places'],
        'callback': 'init_map'
    };

    url = make_url(url, parameters);
    console.log(url);

    var body = document.getElementsByTagName('body')[0];
    var g_script = document.createElement('script');
    g_script.type = 'text/javascript';
    g_script.src = url;
    g_script.async = true;
    g_script.defer = true;
    body.appendChild(g_script);
})();

//==============================================================================

var map;

function init_map()
{
    // Google Maps Styling
    // Takes default values if not all values are given or even empty
    var my_styledMapType = new google.maps.StyledMapType(
        [
            {
                elementType: 'geometry',
                stylers: [{color: '#eaeaea'}]
            },
            {
                elementType: 'labels.text.fill',
                stylers: [{color: '#00225b'}]
            },
            {
                elementType: 'labels.text.stroke',
                stylers: [{color: '#edf4ff'}]
            },
            {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{color: '#c9b2a6'}]
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'geometry.stroke',
                stylers: [{color: '#ffb7b7'}]
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'labels.text.fill',
                stylers: [{color: '#6b6968'}]
            },
            {
                featureType: 'landscape.natural',
                elementType: 'geometry',
                stylers: [{color: '#d3e0b1'}]
            },
            {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{color: '#cbce82'}]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{color: '#665854'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry.fill',
                stylers: [{color: '#83c483'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#30753e'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#d1c19e'}]
            },
            {
                featureType: 'road.arterial',
                elementType: 'geometry',
                stylers: [{color: '#dbc053'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{color: '#e9b158'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{color: '#dba355'}]
            },
            {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry',
                stylers: [{color: '#e98d58'}]
            },
            {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry.stroke',
                stylers: [{color: '#db8555'}]
            },
            {
                featureType: 'road.local',
                elementType: 'labels.text.fill',
                stylers: [{color: '#151c38'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'geometry',
                stylers: [{color: '#7f7fa3'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'labels.text.fill',
                stylers: [{color: '#8f7d77'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#ebe3cd'}]
            },
            {
                featureType: 'transit.station',
                elementType: 'geometry',
                stylers: [{color: '#c9cfe5'}]
            },
            {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{color: '#b5dfff'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#6d7269'}]
            }
        ],
        { name: 'Map' }
    );

    // Creates Google Maps at the DOM element which has an id map; with
    // Latitude and Longitude for center and Zoom level (0-21) for area.
    map = new google.maps.Map(
        document.getElementById('map'),
        {
            center: { lat: 37.402349, lng: -121.927459 },
            zoom: 13,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                mapTypeIds: ['my_style', 'hybrid']
            },
            //fullscreenControl: false,
            streetViewControl: false
        }
    );

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('my_style', my_styledMapType);
    map.setMapTypeId('my_style');

    //------------------------------------------------------------------

    ko.applyBindings(new vm());
}

//==============================================================================

var Place = function(id, name, {lat, lng}, category, description, default_icon)
{
    var self = this;

    self.id = id;
    self.name = name;
    self.location = {lat, lng};
    self.category = category;
    self.description = description;

    self.marker = new google.maps.Marker(
        {
            id: self.id,
            position: self.location,
            map: map,
            title: self.name,
            icon: default_icon,
            animation: google.maps.Animation.DROP
        }
    );

    self.showHide_marker = function(state)
    {
        self.marker.setVisible(state);

        if(state == true)
        {
            self.marker.setIcon(default_icon);
            self.marker.setAnimation(google.maps.Animation.DROP);
        }
    }
}

//==============================================================================

function create_marker_icon(url, w, h, s, anchor_ratio)
{
    var ws = w * s;
    var hs = h * s;

    var icon = new google.maps.MarkerImage(
        url,                                                    // url
        new google.maps.Size(ws, hs),                           // size
        new google.maps.Point(0, 0),                            // origin
        new google.maps.Point(((w-1)*s)*anchor_ratio, (h-1)*s), // anchor
        new google.maps.Size(ws, hs)                            // scale
    )

    return icon;
}
