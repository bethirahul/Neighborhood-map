/**
 * @description Function to create a url with parameters (queries)
 * @param {string} url 
 * @param {Object} parameters 
 */
function make_url(url, parameters={})
{
    // Check the number of parameters
    parameters_length = Object.keys(parameters).length;
    // Add parameters if there are any
    if(parameters_length > 0)
    {
        url += '?';
        let k = 0;
        for(key in parameters)
        {
            // Get the value associated to each key in parameters
            value = parameters[key];
            // Check if a value is an array, if so add them with comma
            if(value.constructor === Array)
            {
                url += key + '=' + value[0];
                for(let i=1; i<value.length; i++)
                    url += "," + value[i];
            }
            else
                url += key + '=' + value;
            // This is to not add '&' synbol after the last parameter
            if(k < parameters_length-1)
                url += '&';
            k++;
        }
    }

    return url;
}

// Foursquare client details variables
let fs_client_id = '';
let fs_client_secret = '';

// This anonymous function fetches for keys and adds google maps api script
(function()
{
    // Fetch secrets.json file for the keys
    fetch('secrets.json')
    // Convert the returned data to json
    .then( function(data) { return data.json(); } )
    // Process the JSON data for keys
    .then(
        function(json_data)
        {
            // Search for Google maps API key
            if(json_data.google.key)
            {
                // Store the google maps API key to make the url
                const key = json_data.google.key;

                // Make google maps api url first
                let url = "https://maps.googleapis.com/maps/api/js";
                const parameters = {
                    'key': key,//'AIzaSyCxJAircwo3jIDVpKa2WCDz86mdtX-YOng',
                    // API libraries
                    'libraries': ['geometry', 'drawing', 'places'],
                    // Call back function for google maps api
                    'callback': 'init_map'
                };

                // Call the URL maker function which we defined earlier
                url = make_url(url, parameters);

                // Add the script tag with google maps api url at the end of
                // the body with async and defer
                let body = document.getElementsByTagName('body')[0];
                let g_script = document.createElement('script');
                g_script.type = 'text/javascript';
                g_script.src = url;
                g_script.async = true;
                g_script.defer = true;
                body.appendChild(g_script);
            }
            else
            {
                // Error response for not finding Google maps API key
                let message = "Error: Google Maps API key not found!";
                message += "Please check secrets.json file.";
                alert(message);
            }

            if(json_data.foursquare.client_id)
                fs_client_id = json_data.foursquare.client_id;
            else
            {
                // Error response for not finding Foursquare client ID
                let message = "Error: Foursquare API client ID not found!";
                message += "Please check secrets.json file.";
                alert(message);
            }

            if(json_data.foursquare.client_secret)
                fs_client_secret = json_data.foursquare.client_secret;
            else
            {
                // Error response for not finding Foursquare client secret
                let message = "Error: Foursquare API client secret not found!";
                message += "Please check secrets.json file.";
                alert(message);
            }
        }
    )
    // To catch any error in fetching for secrets.json file
    .catch(
        function(error)
        {
            alert("Error while fetching for API keys: " + error);
        }
    );
})();

//==============================================================================

// Google Maps variable
let map;

/**
 * @description Google maps API call back function
 */
function init_map()
{
    // Google Maps Styling
    // These values are updated over default values
    const my_styledMapType = new google.maps.StyledMapType(
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
            // To change Map types
            mapTypeControl: true,
            // Map type button options
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                mapTypeIds: ['my_style', 'hybrid']
            },
            //fullscreenControl: false,
            streetViewControl: false
        }
    );

    //Associate the Styled map with the MapTypeId and set it to display.
    map.mapTypes.set('my_style', my_styledMapType);
    // Set the Map type to the style we defined earlier
    map.setMapTypeId('my_style');

    //--------------------------------------------------------------------------
    // After the map is initiated, initiate Knockout JS and apply bindings.
    ko.applyBindings(new vm());
}

//==============================================================================
/**
 * @description Place class function (constructor) - for our listings
 * @constructor
 * @param {number} id 
 * @param {string} name 
 * @param {number} lat
 * @param {number} lng
 * @param {string} category 
 * @param {string} description 
 * @param default_icon 
 */
let Place = function(id, name, {lat, lng}, category, description, default_icon)
{
    let self = this;

    self.id = id;
    self.name = name;
    self.location = {lat, lng};
    self.category = category;
    self.description = description;

    // Each place will have their own marker
    self.marker = new google.maps.Marker(
        {
            // Assign id to marker,
            // so that all the information can be grabbed using this id
            id: self.id,
            position: self.location,
            map: map,
            title: self.name,
            icon: default_icon,
            // Animation for Marker
            animation: google.maps.Animation.DROP
        }
    );

    // Show/Hide marker function, this adds additional functionality to
    // animate markers when they are Shown
    // state == true  -> Show Marker
    // state == false -> Hide Marker
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
/**
 * @description Creates icons for Google Maps Markers.
 * @param {string} url Image location
 * @param {number} w Width of the image in pixels
 * @param {number} h Height
 * @param {number} s Scale factor
 * @param {number} anchor_ratio Center of the marker with respect to point 
 *                              on map and its width.
 * @returns Google Maps Marker icon
 */
function create_marker_icon(url, w, h, s, anchor_ratio)
{
    const ws = w * s;
    const hs = h * s;

    const icon = new google.maps.MarkerImage(
        url,                                                    // url
        new google.maps.Size(ws, hs),                           // size
        new google.maps.Point(0, 0),                            // origin
        new google.maps.Point(((w-1)*s)*anchor_ratio, (h-1)*s), // anchor
        new google.maps.Size(ws, hs)                            // scale
    )

    return icon;
}

//==============================================================================
// String manipulation functions

/**
 * @description Matches both strings by seperating words, removing special
 *              characters, removing extra spaces, checking for one of the word.
 * @param {string} input 
 * @param {string} match String which needs to be matched with the input
 * @returns true/false.
 */
function string_match(input, match)
{
    // Convert input to small letters
    input = input.toLowerCase();
    // Split into words seperated by space
    let inputs = input.split(" ");
    // Remove extra spaces on the front, back and in between the words
    inputs = remove_empty_strings(inputs);
    // Remove special characters like "'" in each word
    for(let i=0; i<inputs.length; i++)
        inputs[i] = inputs[i].replace(/[^A-Z0-9]/ig, "");
    input = inputs.join(" ");

    // Convert to be matched string into small letters
    match = match.toLowerCase();
    // Split into words seperated by space
    let matches = match.split(" ");
    // Remove extra spaces on the front, back and in between the words
    matches = remove_empty_strings(matches);
    // Remove special characters like "'" in each word
    for(let i=0; i<matches.length; i++)
        matches[i] = matches[i].replace(/[^A-Z0-9]/ig, "");
    // Make two strings, one combined without spaces, one with spaces
    // then compare the input with both of them
    // without space
    let combined_match1 = matches.join("");
    // with space
    let combined_match2 = matches.join(" ");

    // Return true if any of these three types match
    // String without spaces
    if(combined_match1.startsWith(input))
        return true;
    // with spaces
    else if(combined_match2.startsWith(input))
        return true;
    // input matches with any one word of the the match string
    else
        for(var i=0; i<matches.length; i++)
            if(matches[i].startsWith(input))
                return true;

    // Return false if not matched in any of those conditions
    return false;
}

/**
 * @description This function is used in removing extra spaces in a string
                String Split function creates empty character strings when
                there are more than one space or spaces on the fronmt or back
                of the input string.
 * @param {string[]} string_array
 * @returns string_array
 */
function remove_empty_strings(string_array)
{
    for(let i=0; i<string_array.length; i++)
        if(string_array[i] == '')
        {
            // remove the empty string from the array
            string_array = remove_from_array(i, string_array);
            i--;
        }
    
    return string_array;
}

/**
 * @description Removes a element at given index from an array
 * @param {number} index Index of the element to be removed
 * @param {array} array 
 */
function remove_from_array(index, array)
{
    // Error conditions
    if(!array)
    {
        console.log("Error: array is null");
        return -1;
    }
    if(array.length == 0)
    {
        console.log("Error: array is empty");
        return -1;
    }
    if(index >= array.length)
    {
        console.log("Error: index out of range");
        return -1;
    }
    if(index < 0)
    {
        console.log("Error: index < 0");
        return -1;
    }

    // Move all elements greater than the targetted elements one step front and // pop the last element, reducing the length of the array by one.
    for(var i=index; i<(array.length-1); i++)
        array[i] = array[i+1];
    
    array.pop();

    return array;
}

function arrays_union(array1, array2)
{
    array1.concat(array2);
    for(let i=0; i<(array1.length-1); i++)
    {
        for(let j=(i+1); j<array1.length; j++)
            if(array1[i] === array1[j])
            {
                remove_from_array(j, array1);
                j--;
            }
    }

    return array1;
}
