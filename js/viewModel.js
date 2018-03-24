/**
 * @description Knockout JS View Model
 */
let vm = function()
{
    let self = this;

    // Listings variable 'places'
    self.places = [];
    // This is used to filter places based to category, by default it has All
    // as an option
    self.categories = ko.observableArray(['All']);

    // Creating icons for Markers
    // Default - Normal
    self.default_icon = create_marker_icon(
        'images/marker_icons/flag/default.png', 134, 226, 0.1, 0.04);
    // Highlighted - when mouse hovers on the marker
    self.highlighted_icon = create_marker_icon(
        'images/marker_icons/flag/hover.png', 134, 226, 0.1, 0.04);
    // Selected - when markers is selected, goes to default when deselected
    self.selected_icon = create_marker_icon(
        'images/marker_icons/flag/selected.png', 134, 226, 0.1, 0.04);
    
    // InfoWindow - floating element at a marker - Google maps API
    self.infoWindow = new google.maps.InfoWindow();
    // Close infoWindow when close button on it is pressed
    self.infoWindow.addListener(
        'closeclick',
        function()
        {
            self.close_infoWindow();
        }
    );

    // Function to close infoWindow, set infoWindow's associated marker to null
    // and close
    self.close_infoWindow = function()
    {
        if(self.infoWindow.marker != null)
        {
            self.infoWindow.marker.setIcon(self.default_icon);
            self.infoWindow.marker = null;
            self.infoWindow.close();
        }
    }

    // Clicking the map closes the infoWindow and Lisitngs (side-bar)
    map.addListener(
        'click',
        function()
        {
            self.close_infoWindow();
            self.showHide_listings(false);
        }
    );

    // Anonymous function to load listings into 'places' - getting data for
    // future use.
    (function()
    {
        // Endpoint to our database server (postgreSQL) which gives the
        // listings in JSON format
        // Fetch the data
        fetch("http://localhost:5000/listings/json")
        // Convert the data to JSON
        .then( function(data) { return data.json(); } )
        // Process the JSON data
        .then(
            function(json_data)
            {
                // 'bounds' variable is used to store location (latitude and
                // longitude) of the places (listings) and zoom out the map to
                // fit everything into the view.
                let bounds = new google.maps.LatLngBounds();

                // Cycle through the JSON data for each place and Push to the
                // places array we declared earlier
                for(let i=0; i<json_data.Places.length; i++)
                {
                    // Use the Place class (constructor) to create a new place
                    let new_place = new Place(
                        i,
                        json_data.Places[i].name,
                        json_data.Places[i].location,
                        json_data.Places[i].category,
                        json_data.Places[i].description,
                        self.default_icon
                    )

                    // Add event listeners to each place's marker
                    // Hover - to change icon to highlighted
                    new_place.marker.addListener(
                        'mouseover',
                        function()
                        {
                            if(self.infoWindow.marker != this)
                                this.setIcon(self.highlighted_icon);
                        }
                    );
                    // Back to default icon
                    // Icons won't change when the marker is selected
                    new_place.marker.addListener(
                        'mouseout',
                        function()
                        {
                            if(self.infoWindow.marker != this)
                                this.setIcon(self.default_icon);
                        }
                    );
                    // Click event to show infoWindow at the marker
                    new_place.marker.addListener(
                        'click', function() { self.set_infoWindow(this); });
                    
                    // Push the new place created, with event listeners to the
                    // places array
                    self.places.push(new_place);

                    // Not the location of each new place in bounds variable
                    bounds.extend(new_place.location);
                }

                // If not places were obtained from the JSON data, that means
                // most likely the database might be empty. Alert with an error
                if(self.places.length <= 0)
                {
                    let content = "No places were created.";
                    content += " Data obtained might be empty.";
                    alert(content);
                }
                // If places are obtained
                else
                {
                    // Fit the map with the bounds - showing all places.
                    // Zoom level will goto 20 if there is only one place.
                    map.fitBounds(bounds);
                    if(map.getZoom() > 16)
                        map.setZoom(16);

                    // Collect the category data of each place, to create a
                    // category filter
                    for(let i=0; i<self.places.length; i++)
                    {
                        // To stop duplicating, the category of the current
                        // place (in this loop) is first checked with the list
                        // created from previous places.
                        let found = false;
                        for(let j=1; j<self.categories().length; j++)//[0]='All'
                        {
                            if(self.places[i].category == self.categories()[j])
                            {
                                found = true;
                                j = self.categories().length;
                            }
                        }
                        // if not found, then add to the entry.
                        if(!found)
                            self.categories.push(self.places[i].category);
                    }

                    // Now search all the listings for the first time - this is used to populate the listings side-bar with all the places.
                    self.search_lisitngs();
                }
            }
        )
        // Catch error while fetching for data from server, and alert the user.
        .catch(
            function(error)
            {
                alert("Error occured while fetching for places data: " + error);
            }
        );
    }());

    // This function hides all markers
    self.showHide_all_places = function(state)
    {
        // Close each marker and also close the infoWindow if it is open.
        for(let i=0; i<self.places.length; i++)
            self.places[i].showHide_marker(state);
        if(state == false)
             self.close_infoWindow();
    }

    // Function to set the content and open the infoWindow at the given marker.
    self.set_infoWindow = function(marker)
    {
        // Get the other details from the marker's id. This id is related to the
        // marker's place's index in the places array.
        // Name and Description are shown at the top.
        const name = self.places[marker.id].name;
        const description = self.places[marker.id].description;
        // Category is used to search for Foursquare data for Cafes
        const category = self.places[marker.id].category;

        // Hide listings side-bar, if its open.
        self.showHide_listings(false);
        
        // If the infoWindow is already open, then change the icon of the
        // previous marker to default icon.
        if(self.infoWindow.marker != null)
            self.infoWindow.marker.setIcon(self.default_icon);
        
        // Associate the infoWindow with the given marker.
        self.infoWindow.marker = marker;
        // Change this new marker's icon to Selected icon.
        marker.setIcon(self.selected_icon);

        // Content of infoWindow
        let content = '<div id="infoWindow">';

        content += '<h1>' + name + '</h1>';

        content += "<p>" + description;
        content += "<br/>" + marker.position + "</p>";

        const fourSquare_btn_id = "fourSquare-btn";

        // This div element is for Google street View data, which we are going
        // to fetch after opening the infoWindow.
        content += '<br/><div id="panorama"></div>';

        // If the marker's place is Cafe (category), then create a button
        // which will fetch for Foursquare data (Foursquare API).
        if(category == "Cafe")
        {
            content += '<br/>';
            content += '<input id="' + fourSquare_btn_id + '" class="theme"';
            content += 'type="button" value="More Info [Foursquare]"';
            // Knockout JS data is added here, as FourSquare function is
            // attached to the view Model.
            content += 'data-bind="click: function() { get_fourSquare_data(';
            content += marker.id + ') }"></input><br/>';
        }

        // Content close tag
        content += '</div>';

        // Set content to infoWindow and open it at the marker and on the map.
        self.infoWindow.setContent(content);
        self.infoWindow.open(map, marker);

        // Bind the Foursquare button (if its created) with the Knockout JS
        fourSquare_btn = document.getElementById(fourSquare_btn_id);
        if(fourSquare_btn)
            ko.applyBindings(self, fourSquare_btn);

        // Google Street View data service
        let streetView_service = new google.maps.StreetViewService();
        const radius = 37;

        // Get street view data and call the call back function
        streetView_service.getPanoramaByLocation(
            marker.position,
            radius,
            get_streetView // call-back function
        );

        /**
         * @description Call-back function for the Google Street View data
         * @param {*} data 
         * @param {*} status 
         */
        function get_streetView(data, status)
        {
            // If the response is OK
            if(status == google.maps.StreetViewStatus.OK)
            {
                const nearBy_streetView_location = data.location.latLng;
                const heading = google.maps.geometry.spherical.computeHeading(
                    nearBy_streetView_location,
                    marker.position
                );

                const panorama_options = {
                    position: nearBy_streetView_location,
                    pov: {
                        heading: heading,
                        pitch: 20
                    }
                };
                let panorama = new google.maps.StreetViewPanorama(
                    document.getElementById("panorama"),
                    panorama_options
                );
                panorama.setVisible(true);
            }
            // If the response is NOT OK, write error message on infoWindow.
            else
            {
                content += "<div>Couldn't get Street View for this";
                content += "location</div>";
                self.infoWindow.setContent(content);
            }
        }
    }

    // Function to fetch for FourSquare data (API)
    self.get_fourSquare_data = function(place_id)
    {
        // Get place details from its id (place_id)
        const name = self.places[place_id].name;
        const lat = self.places[place_id].location.lat;
        const lng = self.places[place_id].location.lng;

        // This is the ID given by Foursquare (API Docs) for Cafe category
        const category_id = '4bf58dd8d48988d16d941735';

        // Foursquare API endpoint to search for venues
        let url = 'https://api.foursquare.com/v2/venues/search';
        
        const parameters = {
            // Client ID and secret obtained along with google API key from
            // secrets.json file.
            'client_id': fs_client_id,
            'client_secret': fs_client_secret,
            // Current version of Foursquare API
            'v': '20170801',
            'categoryId': category_id,
            // Output limit to 1 - as we need the exact place.
            'limit': '1',
            // Location of the place, used in search
            'll': [lat, lng],
            // URL cannot have spaces, replace it with +
            'query': name.split(' ').join('+'),
            // Search for anything, not just which can be checked-in
            'intent': 'global'
        };

        // Make Foursquare search URL
        url = make_url(url, parameters);

        // Fetch for Foursquare data
        fetch(url)
        // Convert the response to JSON
        .then( function(data) { return data.json(); } )
        // Process the JSON data
        .then(
            function(json_data)
            {
                // If response is OK
                if(json_data.meta.code == 200)
                {
                    let content = '';
                    // If no venues were obtained, then say sorry to user ;-)
                    if(json_data.response.venues.length == 0)
                    {
                        content += '<p>Sorry! This place is not found in';
                        content += ' FourSquare</p>';
                    }
                    // If venue is found, then display the name and get the
                    // other details, by another Foursquare API endpoint
                    else
                    {
                        const place = json_data.response.venues[0];
                        content += '<h1>' + place.name + '</h1>';

                        // Function to get more details with Foursquare place id
                        self.get_fourSquare_details(place.id, content);
                    }

                    // Set the content with what is obtained so far. replacing 
                    // what is there on the infoWIndow (Google Street View).
                    self.infoWindow.setContent(content);
                }
                // If response code is something else - error
                else if(json_data.meta.code)
                {
                    // alert the user with error details
                    let message = "Error in fetching FourSquare data.";
                    message += '\n\nError type: ';
                    message += json_data.meta.errorType;
                    message += '\n' + json_data.meta.errorDetail;
                    alert(message);
                }
            }
        )
        // Catch the error from Foursquare search API call, alert the user.
        .catch(
            function(error)
            {
                alert("Error during fetching for FourSquare data: " + error);
            }
        );
    }

    // Another Foursquare API endpoint to get more details about a particular
    // place, using the place's foursquare id.
    self.get_fourSquare_details = function(venue_id, content)
    {
        // Foursquare API endpoint to get venue (place) details, with its id.
        let url = 'https://api.foursquare.com/v2/venues/' + venue_id;
        const parameters = {
            'client_id': fs_client_id,
            'client_secret': fs_client_secret,
            'v': '20170801'
        }
        // Make the URL with parameters
        url = make_url(url, parameters);

        // Fetch for Foursquare data (details)
        fetch(url)
        // Convert the response to JSON
        .then( function(data) { return data.json(); } )
        // Process the JSON data
        .then(
            function(json_data)
            {
                // If response is OK
                if(json_data.meta.code == 200)
                {
                    const details = json_data.response.venue;

                    // If url is found, add url to content, open this link
                    // in another tab.
                    if(details.url)
                    {
                        content += '<a href=' + details.url;
                        content += ' target="_blank">';
                        content += 'visit their website</a>';
                    }
                    // If rating is found, add it to content
                    if(details.rating)
                    {
                        content += '<br/><br/><p>Rating: ' + details.rating;
                        content += '</p>';
                    }
                    // If working hours are found, add them to content
                    if(details.hours)
                    {
                        content += '<br/>';

                        const hours = details.hours;
                        // First add next opening or closing time
                        if(hours.status)
                            content += '<p>' + hours.status + '</p>';
                        // then add all timings
                        if(hours.timeframes)
                        {
                            content += '<br/><p>Hours:<br/>';
                            for(let i=0; i<hours.timeframes.length; i++)
                            {
                                content += hours.timeframes[i].days;
                                content += ' - ' + hours.timeframes[i]
                                        .open[0].renderedTime + '<br/>';
                            }
                            content += '</p>';
                        }
                    }

                    // Also add Foursquare link of that place, open this link
                    // in another tab.
                    if(details.canonicalUrl)
                    {
                        content += '<br/><a href=' + details.canonicalUrl;
                        content += ' target="_blank">';
                        content += 'More at Foursquare...</a>';
                    }

                    // Update the content on the infoWindow with all the above
                    // data collected.
                    self.infoWindow.setContent(content);
                }
                // If the response code was something else - error
                else if(json_data.meta.code)
                {
                    // alert the user with error details
                    let message = "Error in fetching FourSquare details.";
                    message += '\n\nError type: ';
                    message += json_data.meta.errorType;
                    message += '\n' + json_data.meta.errorDetail;
                    alert(message);
                }
            }
        )
        .catch(
            function(error)
            {
                alert("Error during fetching for FourSquare details: " + error);
            }
        );

        return content;
    }

    // Knockout JS observable for text on the Show listings button
    // This button is used to open/close listings side-bar.
    self.listings_btn_text = ko.observable('Show Listings');

    // Function for lisitngs open/close button (toggle).
    self.toggle_listings = function()
    {
        if(self.listings_btn_text() == 'Show Listings')
            self.showHide_listings(true);
        else
            self.showHide_listings(false);
    }

    // Knockout JS observable to show/hide listings side-bar
    self.display_listings = ko.observable(false);

    // Function to show/hide listings side-bar
    // state == true  -> Show listings side-bar
    // state == false -> Hide listings side-bar
    self.showHide_listings = function(state)
    {
        self.display_listings(state);

        // Change toggle button text along with showing or hiding.
        if(state == true)
            self.listings_btn_text('Hide Listings');
        else
            self.listings_btn_text('Show Listings');
    }

    // Knockout JS observable to get the search input.
    self.search_query = ko.observable("");
    // Add functionality to search when search input is changed.
    self.search_query.subscribe( function() { self.search_lisitngs(); } );

    // Knockout JS observable to get category (to filter).
    self.search_category = ko.observable("All");
    // Add functionality to search when this filter is changed.
    self.search_category.subscribe( function() { self.search_lisitngs(); } );

    /* Knockout JS observable array to get all the places from the search
    results. This array is showed in the side-bar as buttons. Clicking each
    button will open, that place, infoWindow. Markers of only these places are
    shown on the map.*/
    self.search_results = ko.observableArray([]);

    // Knockout JS observable - sued to display an error message if no places
    // were found.
    self.search_results_found = ko.observable(true);

    // Function to search for listings based on search input and category filter
    self.search_lisitngs = function()
    {
        // First filter with category, if 'All' option is selected, then get
        // all places.
        let category_results = [];
        if(self.search_category() == self.categories()[0])
            category_results = self.places;
        // if not, get allplaces which match with the category option selected.
        else
            for(let i=0; i<self.places.length; i++)
                if(self.search_category() == self.places[i].category)
                    category_results.push(self.places[i]);

        // Empty the search_results array.
        self.search_results([]);
        // If no input is given, then get all the results from category filter.
        if(self.search_query() == '')
            self.search_results(category_results);
        // If input is given, then match it with the place names using the
        // string match functions we declared earlier.
        // All the results mathced are now updated into the knockout observable
        // variable, which will update our page.
        else
        {
            // Check if search query matched with category names
            // If so, output all places with that category
            let matched_category = [];
            if(self.search_category() == self.categories()[0])
                for(let i=0; i<self.categories().length; i++)
                    if(string_match(self.search_query(), self.categories()[i]))
                    {
                        for(let j=0; j<self.places.length; j++)
                            if(self.categories()[i] == self.places[j].category)
                                matched_category.push(self.places[j]);
                        break;
                    }
            
            // Check if search query matches with any place name 
            let matched_name = [];
            for(let i=0; i<category_results.length; i++)
                if(string_match(self.search_query(), category_results[i].name))
                    matched_name.push(category_results[i]);
            
            // If we got above two results, then take the union of them
            if(matched_category.length > 0 && matched_name.length > 0)
            {
                let results = arrays_union(matched_category, matched_name);
                for(let i=0; i<matched_category.length; i++)
                self.search_results(results);
            }
            // else, show which one of those two got results
            else if(matched_category.length > 0)
                self.search_results(matched_category);
            else
                self.search_results(matched_name);
        }

        // Hide all markers and show only those places' markers which are now
        // obtained from results.
        self.showHide_all_places(false);

        const results_length = self.search_results().length;
        // If no results were found, then show the error message.
        if(results_length == 0)
            self.search_results_found(false);
        else
        {
            self.search_results_found(true);
            if(results_length == self.places.length)
                self.showHide_all_places(true);
            else
            {
                for(let i=0; i<results_length; i++)
                {
                    const id = self.search_results()[i].id;
                    self.places[id].showHide_marker(true);
                }
            }

            // Setting map bounds to the results.
            let bounds = new google.maps.LatLngBounds();
            for(let i=0; i<results_length; i++)
                bounds.extend(self.search_results()[i].location);
            map.fitBounds(bounds);
            
            // Zoom level will goto 20 if there is only one place.
            if(map.getZoom() > 16)
                map.setZoom(16);
        }
    }

    // Function for clear button - clears both search and category filter.
    self.clear_search = function()
    {
        self.search_query("");
        self.search_category(self.categories()[0]);
    }
}
