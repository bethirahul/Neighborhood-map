# My Neighborhood Map

This is my Neighborhood map _(web app)_, built by myself _**Rahul Bethi**_.

It shows some of the places I love in _Bay area, California_.

It uses [**Google Maps API**](https://developers.google.com/maps/) to show a customized map, with my favorite places as markers on the map. Click the markers to get more info of the places. Google Street view near the place. [**Foursquare API**](https://developer.foursquare.com/) is used to get more info about Cafés. All these places can be searched and filtered by category.

This app uses a **PostgreSQL database** and **Python server** to get the places in JSON format. It then processes this data and shows them as markers on the map.

## Built using

- [**HTML**](https://developer.mozilla.org/en-US/docs/Web/HTML), [**Javascript**](https://developer.mozilla.org/en-US/docs/Web/JavaScript), [**Knockout JS**](http://knockoutjs.com/downloads/index.html) v3.4.2 _(organizational framework)_, [**Google Maps API**](https://developers.google.com/maps/) v3.31, [**Foursquare API**](https://developer.foursquare.com/) v2 20170801.
- [**Python**](https://www.python.org/downloads/) v3.6.4 _(web server)_, [**PostgreSQL**](https://www.postgresql.org/download/) v10.3 _(database)_.

## Instructions to run

1. Install database software - [**PostgreSQL**](https://www.postgresql.org/download/) v10.3.
2. Install [**Python**](https://www.python.org/downloads/) v3.6.4, and then ``pip install``:
    - [``flask``](http://flask.pocoo.org/) (microframework for Python)
    - [``sqlalchemy``](https://www.sqlalchemy.org/) (Python SQL toolkit)
3. Setup Database:
    - Setup a database.
        - _I used [pgAdmin](https://www.pgadmin.org/) 4 v2.1 which is installed along with PostgreSQL database software for Windows._
    - Make a new json file named ``secrets.json`` in [``database_server``](/database_server/) folder.
        - Fill out the JSON file with database name, username and password to access the database.
            ```json
            {
                "postgresql":
                {
                    "user": "USERNAME",
                    "password": "PASSWORD",
                    "database": "DATABASE_NAME"
                }
            }
            ```
    - Run [``database_setup.py``](/database_server/database_setup.py) using Python to setup the database with the Listing table.
    - Populate the database with values by running [``init_values.py``](/database_server/init_values.py) using Python.
4. Run [``app.py``](/database_server/app.py) using Python, the app will be up and running on [localhost:5000](http://localhost:5000) address. Press **Ctrl**+**C** a couple of times to stop the server.
    - You can check the database server _(python app)_ JSON output at [http://localhost:5000/listings/json](http://localhost:5000/listings/json).
5. Get a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) and [Foursquare API Client ID and Client Secret](https://foursquare.com/developers/login?continue=%2Fdevelopers%2Fapps).
    - For Google - Create a project and add [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/) and [Google Street View Image API](https://developers.google.com/maps/documentation/streetview/) to your project.
6. Make a new json file named ``secrets.json`` in the [``root``](../../) folder.
    - Fill out the JSON file with the [_Google Maps API key_](https://developers.google.com/maps/documentation/javascript/get-api-key) and [_Foursquare API Client details_](https://foursquare.com/developers/login?continue=%2Fdevelopers%2Fapps).
        ```json
        {
            "google": {
                "key": "GOOGLE_MAPS_API_KEY"
            },
            "foursquare": {
                "client_id": "FOURSQUARE_API_CLIENT_ID",
                "client_secret": "FOURSQUARE_API_CLIENT_SECRET"
            }
        }
        ```
7. Open [``index.html``](/index.html).

## Design

1. **PostgreSQL database** is setup and stored with the data about my favourite places.
    - _Database_ can be accessed by **Python** (using _**SQLALchemy** toolkit_) using the ``database name``, ``username`` and ``password`` located in the [``secrets.json``](/database_server/secrets.json) file inside database_server folder.
    - Python file [``database_setup.py``](/database_server/database_setup.py) creates the '_Listing_' table in the _database_.
        - Each _place_ (column of table '_Listing_') contains: ``name``, ``category``, location (``latitude``, ``longitide``), and ``description``.
    - [``init_values.py``](/database_server/init_values.py) python file adds some of my favorite places (in _Bay area, California_) to the '_Listings_' table in the _database_.
2. [**Python web server** (``app.py``)](/database_server/app.py) runs at [localhost:5000](http://localhost:5000).
    - It extracts the _places_ from the _database_ and sends back in JSON format at [``http://localhost:5000/listings/json``](http://localhost:5000/listings/json).
3. The [**Web app** (``index.html``)](/index.html) is our main app.
    - It calls two javascript files [``init.js``](/js/init.js) and [``viewModel.js``](/js/viewModel.js).
4. The [``init.js``](/js/init.js) Javascript file inititates the map and then calls the **Knockout JS** to bind with rest of the code, as everything is dependent on the Google Map.
    - It first extracts the **_API Keys_** from [``secrets.json``](/secrets.json) JSON file in the [``root``](../../) folder.
    - It then loads the **Google Maps API** script using the _Google Maps API key_ in an asynchronous way.
    - **Knockout JS** is setup after the Google Maps API is loaded.
5. The [``viewModel.js``](/js/viewModel.js) Javascript file is the View-Model of the Knockout JS organizational framework. It has all the observational variables and bindings. It also has other variables (Google Maps API, Foursquare API).
    - It requests the _places_ data from the _database sever_ we setup earlier.
        - **_Note:_** If you change the [``server-address``](https://github.com/bethirahul/Neighborhood-map/blob/b62a393413723060328dea2ae0817695985b007e/database_server/app.py#L71) and JSON data [``end-point``](https://github.com/bethirahul/Neighborhood-map/blob/b62a393413723060328dea2ae0817695985b007e/database_server/app.py#L54) in the [web server (``app.py``)](/database_server/app.py), you need to update it [here (``viewModel.js``)](https://github.com/bethirahul/Neighborhood-map/blob/b62a393413723060328dea2ae0817695985b007e/js/viewModel.js#L65) as well.
    - With the obtained JSON data, it creates _Places Objects_ with **_Google Maps API Markers_**.
    - Clicking on each _marker_ on the map will open a small window with that _place_'s ``name``, location (``latitude``, ``longitude``) and ``description``.
        - Google Street View -- Along with these, it then requests the **_Google Street View Image API_** service to get the nearest _360 image_ and displays it when received.
        - Foursquare -- For _cafes_, there is a _button_ '_More info_' to search for _Foursquare data_ about the _place_.
            - Clicking that _button_ will request **_Foursquare API - Search for Venues_** service to search for the _cafe_ with the ``name``, location (``latitude``, ``longitude``) and ``category`` of the _cafe_. Received _response_ (JSON) will have some details about the _cafe_ along with its ``venue ID``.
            - Using this ``venue ID``, another request is made to **_Foursquare API - Venues_** service for more details about the _cafe_. Received _response_ (JSON) will have more details about the _cafe_. _Website_, _rating_, _working hours_ and _Foursquare link_ of the _cafe_ are taken from the _response_ and displayed.
            - Not all places are available on _Foursquare_, a _sorry_ message is displayed when a _cafe_ is not found.
    - 
