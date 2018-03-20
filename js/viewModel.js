
var vm = function()
{
    var self = this;

    //---- init
    self.places = [];

    self.default_icon = create_marker_icon(
        'images/marker_icons/flag/default.png', 134, 226, 0.1, 0.04);
    self.highlighted_icon = create_marker_icon(
        'images/marker_icons/flag/hover.png', 134, 226, 0.1, 0.04);
    self.selected_icon = create_marker_icon(
        'images/marker_icons/flag/selected.png', 134, 226, 0.1, 0.04);

    self.infoWindow = new google.maps.InfoWindow();
    self.infoWindow.addListener('closeclick', self.close_infoWindow);

    self.close_infoWindow = function()
    {
        if(self.infoWindow.marker != null)
        {
            self.infoWindow.marker.setIcon(self.default_icon);
            self.infoWindow.marker = null;
            self.infoWindow.close();
        }
    }

    (function()
    {
        //fetch("http://localhost:5000/listings/json")
        fetch("http://192.168.0.107:5000/listings/json")
        //fetch("http://192.168.1.220:5000/listings/json")
        .then( function(data) { return data.json(); } )
        .then(
            function(json_data)
            {
                for(var i=0; i<json_data.Places.length; i++)
                {
                    var new_place = new Place(
                        i,
                        json_data.Places[i].name,
                        json_data.Places[i].location,
                        json_data.Places[i].category,
                        json_data.Places[i].description
                    )
                    //new_place.marker.setVisible(false);
                    self.places.push(new_place);
                    //bounds.extend(new_place.location);
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

                if(self.places.length > 0)
                    self.show_places();
                else
                {
                    var content = "No places were created.";
                    content += "\nData obtained might be empty.";
                    alert(content);
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

    self.show_places = function()
    {
        console.log("Show places is called");
    }
}

//ko.applyBindings(new vm());

//==============================================================================
