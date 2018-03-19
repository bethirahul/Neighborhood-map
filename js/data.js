var Place = function(id, name, {lat, lng}, category, description)
{
    var self = this;

    self.id = id;
    self.name = name;
    self.location = {lat, lng};
    self.category = category;
    self.description = description;
}