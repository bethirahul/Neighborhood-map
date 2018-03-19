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
        'callback': 'initMap'
    };

    url = make_url(url, parameters);

    var body = document.getElementsByTagName('body')[0];
    var g_script = document.createElement('script');
    g_script.type = 'text/javascript';
    g_script.src = url;
    g_script.async = true;
    g_script.defer = true;
    body.appendChild(g_script);
})();

//==============================================================================


