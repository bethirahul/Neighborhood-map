
var vm = function()
{
    var self = this;

    //---- init
    self.places = [];
    self.categories = ko.observableArray(['All']);

    self.default_icon = create_marker_icon(
        'images/marker_icons/flag/default.png', 134, 226, 0.1, 0.04);
    self.highlighted_icon = create_marker_icon(
        'images/marker_icons/flag/hover.png', 134, 226, 0.1, 0.04);
    self.selected_icon = create_marker_icon(
        'images/marker_icons/flag/selected.png', 134, 226, 0.1, 0.04);

    self.infoWindow = new google.maps.InfoWindow();
    self.infoWindow.addListener(
        'closeclick',
        function()
        {
            self.close_infoWindow();
        }
    );

    self.close_infoWindow = function()
    {
        if(self.infoWindow.marker != null)
        {
            self.infoWindow.marker.setIcon(self.default_icon);
            self.infoWindow.marker = null;
            self.infoWindow.close();
        }
    }

    map.addListener(
        'click',
        function()
        {
            self.close_infoWindow();
        }
    );

    (function()
    {
        //fetch("http://localhost:5000/listings/json")
        fetch("http://192.168.0.107:5000/listings/json")
        //fetch("http://192.168.1.220:5000/listings/json")
        .then( function(data) { return data.json(); } )
        .then(
            function(json_data)
            {
                var bounds = new google.maps.LatLngBounds();
                for(var i=0; i<json_data.Places.length; i++)
                {
                    var new_place = new Place(
                        i,
                        json_data.Places[i].name,
                        json_data.Places[i].location,
                        json_data.Places[i].category,
                        json_data.Places[i].description,
                        self.default_icon
                    )
                    new_place.marker.addListener(
                        'mouseover',
                        function()
                        {
                            if(self.infoWindow.marker != this)
                                this.setIcon(self.highlighted_icon);
                        }
                    );
                    new_place.marker.addListener(
                        'mouseout',
                        function()
                        {
                            if(self.infoWindow.marker != this)
                                this.setIcon(self.default_icon);
                        }
                    );
                    new_place.marker.addListener(
                        'click', function() { self.set_infoWindow(this); });
                    
                    self.places.push(new_place);
                    bounds.extend(new_place.location);
                }
                console.log("Created Places:");
                for(var i=0; i<self.places.length; i++)
                {
                    out_data = {
                        name: self.places[i].name,
                        location: self.places[i].location,
                        category: self.places[i].category,
                        description: self.places[i].description
                    };
                    console.log(out_data);
                }

                if(self.places.length <= 0)
                {
                    var content = "No places were created.";
                    content += " Data obtained might be empty.";
                    alert(content);
                }
                else
                {
                    map.fitBounds(bounds);

                    for(var i=0; i<self.places.length; i++)
                    {
                        var found = false;
                        for(var j=1; j<self.categories().length; j++)//[0]='All'
                        {
                            if(self.places[i].category == self.categories()[j])
                            {
                                found = true;
                                j = self.categories().length;
                            }
                        }
                        if(!found)
                            self.categories.push(self.places[i].category);
                    }
                    self.search_lisitngs();
                    console.log(self.categories());
                }
            }
        )
        .catch(
            function(error)
            {
                alert("Error occured while fetching for places data: " + error);
            }
        );
    }());

    self.showHide_all_places = function(state)
    {
        for(var i=0; i<self.places.length; i++)
            self.places[i].showHide_marker(state);
        if(state == false)
             self.close_infoWindow();
    }

    self.set_infoWindow = function(marker)
    {
        var name = self.places[marker.id].name;
        var description = self.places[marker.id].description;
        var category = self.places[marker.id].category;

        self.showHide_listings(false);
        
        if(self.infoWindow.marker != null)
            self.infoWindow.marker.setIcon(self.default_icon);
        
        self.infoWindow.marker = marker;
        /*self.infoWindow.setContent("#");
        self.infoWindow.open(map, marker);*/

        var content = '<div id="infoWindow">';

        content += '<h1>' + name + '</h1>';

        content += "<p>" + description;
        content += "<br/>" + marker.position + "</p>";

        var fourSquare_btn_id = "fourSquare-btn";

        content += '<br/><div id="panorama"></div>';

        if(category == "Cafe")
        {
            content += '<br/>';
            content += '<input id="' + fourSquare_btn_id + '" class="theme"';
            content += 'type="button" value="More Info [Foursquare]"';
            content += 'data-bind="click: function() { get_fourSquare_data(';
            content += marker.id + ') }"></input><br/>';
        }

        content += '</div>';

        self.infoWindow.setContent(content);
        self.infoWindow.open(map, marker);

        fourSquare_btn = document.getElementById(fourSquare_btn_id);
        if(fourSquare_btn)
            ko.applyBindings(self, fourSquare_btn);

        var streetView_service = new google.maps.StreetViewService();
        var radius = 37;

        streetView_service.getPanoramaByLocation(
            marker.position,
            radius,
            get_streetView
        );

        function get_streetView(data, status)
        {
            if(status == google.maps.StreetViewStatus.OK)
            {
                var nearBy_streetView_location = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearBy_streetView_location,
                    marker.position
                );

                var panorama_options = {
                    position: nearBy_streetView_location,
                    pov: {
                        heading: heading,
                        pitch: 20
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById("panorama"),
                    panorama_options
                );
                panorama.setVisible(true);
            }
            else
            {
                content += "<div>Couldn't get Street View for this";
                content += "location</div>";
                self.infoWindow.setContent(content);
            }
        }
    }

    self.get_fourSquare_data = function(place_id)
    {
        var category = self.places[place_id].category;
        var name = self.places[place_id].name;
        var lat = self.places[place_id].location.lat;
        var lng = self.places[place_id].location.lng;

        var category_id;
        if(category == 'Cafe')
            category_id = '4bf58dd8d48988d16d941735';

        var url = 'https://api.foursquare.com/v2/venues/search';
        
        var parameters = {
            'client_id': 'HTBFZRTZTZPNMI5RU1VCGPBCUZR0NK4XXPQFWTPSCCVHBVBL',
            'client_secret': 'TLUBLKEWGFURA5TIUC5K0EXHKOMQ551BINJGFM0NXA2SNZHB',
            'v': '20170801',
            'categoryId': category_id,
            'limit': '1',
            'll': [lat, lng],
            'query': name.split(' ').join('+'),
            'intent': 'global'
        };

        url = make_url(url, parameters);

        fetch(url)
        .then( function(data) { return data.json(); } )
        .then(
            function(json_data)
            {
                if(json_data.meta.code == 200)
                {
                    var content = '';
                    if(json_data.response.venues.length == 0)
                    {
                        content += '<p>Sorry! This place is not found in';
                        content += ' FourSquare</p>';
                    }
                    else
                    {
                        var place = json_data.response.venues[0];
                        content += '<h1>' + place.name + '</h1>';

                        self.get_fourSquare_details(place.id, content);
                    }

                    self.infoWindow.setContent(content);
                }
                else if(json_data.meta.code)
                {
                    var message = "Error in fetching FourSquare data.";
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
                alert("Error during fetching for FourSquare data: " + error);
            }
        );
    }

    self.get_fourSquare_details = function(venue_id, content)
    {
        var url = 'https://api.foursquare.com/v2/venues/' + venue_id;
        var parameters = {
            'client_id': 'HTBFZRTZTZPNMI5RU1VCGPBCUZR0NK4XXPQFWTPSCCVHBVBL',
            'client_secret': 'TLUBLKEWGFURA5TIUC5K0EXHKOMQ551BINJGFM0NXA2SNZHB',
            'v': '20170801'
        }

        url = make_url(url, parameters);

        fetch(url)
        .then( function(data) { return data.json(); } )
        .then(
            function(json_data)
            {
                if(json_data.meta.code == 200)
                {
                    var details = json_data.response.venue;

                    if(details.url)
                    {
                        content += '<a href=' + details.url;
                        content += ' target="_blank">';
                        content += 'visit their website</a>';
                    }

                    if(details.rating)
                    {
                        content += '<br/><br/><p>Rating: ' + details.rating;
                        content += '</p>';
                    }

                    if(details.hours)
                    {
                        content += '<br/>';

                        var hours = details.hours;
                        if(hours.status)
                            content += '<p>' + hours.status + '</p>';
                        if(hours.timeframes)
                        {
                            content += '<br/><p>Hours:<br/>';
                            for(var i=0; i<hours.timeframes.length; i++)
                            {
                                content += hours.timeframes[i].days;
                                content += ' - ' + hours.timeframes[i]
                                        .open[0].renderedTime + '<br/>';
                            }
                            content += '</p>';
                        }
                    }

                    if(details.canonicalUrl)
                    {
                        content += '<br/><a href=' + details.canonicalUrl;
                        content += ' target="_blank">';
                        content += 'More at Foursquare...</a>';
                    }

                    self.infoWindow.setContent(content);
                }
                else if(json_data.meta.code)
                {
                    var message = "Error in fetching FourSquare details.";
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

    self.listings_btn_text = ko.observable('Show Listings');

    self.toggle_listings = function()
    {
        if(self.listings_btn_text() == 'Show Listings')
            self.showHide_listings(true);
        else
            self.showHide_listings(false);
    }

    self.display_listings = ko.observable(false);

    self.showHide_listings = function(state)
    {
        self.display_listings(state);

        if(state == true)
            self.listings_btn_text('Hide Listings');
        else
            self.listings_btn_text('Show Listings');
    }

    self.search_query = ko.observable("");
    self.search_query.subscribe( function() { self.search_lisitngs(); } );

    self.search_category = ko.observable("All");
    self.search_category.subscribe( function() { self.search_lisitngs(); } );

    self.search_results = ko.observableArray([]);

    self.search_results_found = ko.observable(true);

    self.search_lisitngs = function()
    {
        /*console.log(self.search_query());
        console.log(self.search_category());*/

        var category_results = [];
        if(self.search_category() == self.categories()[0])
            category_results = self.places;
        else
        {
            for(var i=0; i<self.places.length; i++)
            {
                if(self.search_category() == self.places[i].category)
                    category_results.push(self.places[i]);
            }
        }

        self.search_results([]);
        if(self.search_query() == '')
            self.search_results(category_results);
        else
        {
            /*var inputs = self.search_query().split(" ");
            for(var j=0; j<inputs.length; j++)
                inputs[j] = inputs[j].replace(/[^A-Z0-9]/ig, "");
            var input = inputs.join(" ");*/

            for(var i=0; i<category_results.length; i++)
            {
                /*var name = category_results[i].name.toLowerCase();

                var names = name.split(" ");
                for(var j=0; j<names.length; j++)
                    names[j] = names[j].replace(/[^A-Z0-9]/ig, "");
                
                var combined_name1 = names.join("");

                var combined_name2 = names.join(" ");

                var found = false;
                if(combined_name1.startsWith(input))
                    found = true;
                else if(combined_name2.startsWith(input))
                    found = true;
                else
                    for(var j=0; j<names.length; j++)
                        if(names[j].startsWith(input))
                        {
                            found = true;
                            j = names.length;
                        }

                if(found)
                    self.search_results.push(category_results[i]);*/

                if(string_match(self.search_query(), category_results[i].name))
                    self.search_results.push(category_results[i]);
            }
        }

        self.showHide_all_places(false);
        var results_length = self.search_results().length;
        if(results_length == 0)
            self.search_results_found(false);
        else
        {
            self.search_results_found(true);
            if(results_length == self.places.length)
                self.showHide_all_places(true);
            else
            {
                for(var i=0; i<results_length; i++)
                {
                    var id = self.search_results()[i].id;
                    self.places[id].showHide_marker(true);
                }
            }
        }
    }

    self.clear_search = function()
    {
        self.search_query("");
        self.search_category(self.categories()[0]);
    }
}

//ko.applyBindings(new vm());

//==============================================================================
