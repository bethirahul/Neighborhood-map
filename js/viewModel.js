var vm = function()
{
    var self = this;

    //---- init
    self.places = [];

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
            }
        )
        .catch(
            function(error)
            {
                console.log("Error occured while fetching for places data:")
                console.log(error);
            }
        );
    })();
}

ko.applyBindings(new vm());

//==============================================================================
