# My Neighborhood Map

Application link: [https://**rahulbethi**.com/**neighborhood_map**](https://rahulbethi.com/neighborhood_map)

This is my Neighborhood map _(web app)_, built by myself [_**Rahul Bethi**_](https://rahulbethi.com).

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
    - **_Note_:** If you change the [``server-address``(here)](https://github.com/bethirahul/Neighborhood-map/blob/b62a393413723060328dea2ae0817695985b007e/database_server/app.py#L71) and JSON data [``end-point``(here)](https://github.com/bethirahul/Neighborhood-map/blob/b62a393413723060328dea2ae0817695985b007e/database_server/app.py#L54) in the [web server (``app.py``)](/database_server/app.py), you need to update it [here (``viewModel.js``)](https://github.com/bethirahul/Neighborhood-map/blob/c70b0718bdf3bf1a34d2c78bd1bfb0cc8f5f63b4/js/viewModel.js#L65) as well.
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

3. The [**Web-app** (``index.html``)](/index.html) is our main app.
    - It calls two javascript files [``init.js``](/js/init.js) and [``viewModel.js``](/js/viewModel.js).

4. The [``init.js``](/js/init.js) Javascript file inititates the map and then calls the **Knockout JS** to bind with rest of the code, as everything is dependent on the Google Map.
    - It first extracts the **_API Keys_** from [``secrets.json``](/secrets.json) JSON file in the [``root``](../../) folder.
    - It then loads the **Google Maps API** script using the _Google Maps API key_ in an asynchronous way.
    - **Knockout JS** is setup after the Google Maps API is loaded.

5. The [``viewModel.js``](/js/viewModel.js) Javascript file is the View-Model of the Knockout JS organizational framework with all the observational variables and bindings. It also has other functions and variables (Google Maps API, Foursquare API and search-filter features).
    - It requests the _places_ data from the _database sever_ we setup earlier.
    - With the obtained JSON data, it creates 'places' objects with **Google Maps API _Markers_**.
    - Categories of all the places are noted to filter out places with categories.
    - It also has all other remaining variables and functions related to the functionality of the web-app.

6. **Web-app** consists a map with **_Markers_** of all the places. Each _Marker_ is located at the ``latitude`` and ``longitude`` of it's place on the map. Web-app also has a '_Show Listings_' button on the top-left corner.

7. **_Markers_:** Clicking on each _Marker_ on the map will open a small window with ``name``, location (``latitude``, ``longitude``) and ``description`` of that _marker_'s place.

    - Google Street View -- Web app then requests the **Google Street View Image API** service to get the nearest 360 image and displays it in that window, when received.

    - Foursquare -- For cafés, there will be a button '_More info_' in that window to search for Foursquare data about the café. Clicking that button will request **Foursquare API _Search for Venues_** service to search for the café with the ``name`` and location (``latitude``, ``longitude``) of the café along with _Foursquare category ID for cafe_ - ``4bf58dd8d48988d16d941735``. Received response (JSON) will have some details about the café along with its ``venue ID``.
        - **_Note_:** Not all places are available on Foursquare, a _sorry_ message is displayed when a café is not found.
    - Using this ``venue ID``, a different request is made to **Foursquare API _Venues_** service for more details. Received response (JSON) will have all the details about the café. ``website``, ``rating``, ``working hours`` and ``Foursquare link`` of the café are taken from the response and displayed.
        - **_Note_:** Not all places will have all the details.

    - Each _Marker_ has three **icons**.
        1. [Default icon](/images/marker_icons/flag/default.png) - normal
        2. [Highlighted icon](/images/marker_icons/flag/hover.png) - when mouse hovers over the marker.
        3. [Selected icon](/images/marker_icons/flag/selected.png) - when the marked is clicked and info window is opened.
    - **Drop-animation** is played when a marker is shown after hiding them.

8. **_Listings_ side-bar** (place's link)**:** Clicking on the '_Show Listings_' button will open a side-bar with all the place names as links. Here, the word _Listing_ is used for a place's link.
    - Clicking a _Listing_ is same as clicking that place's _Marker_, but also closes the side-bar.
    - The side-bar also has search feature to search for places and show the short-listed _Listings_. It has three elements.
        1. An input field to type the place name or category name.
        2. A drop-down menu to choose category - to filter out places with that category.
            - Options of this menu is taken from the categories of all places.
        3. A '_Clear_' button to clear the input field and reset drop-down menu to '_All_' places.
    - _Listings_ can be scrolled up-down, if they don't fit in the page.

9. **Search (filter):** Search is done as you type, for each character or option selected.
    - First, category drop-down menu (filter) is checked. '_All_' option represents all places. Selecting any other category option will filter out places which are doesn't belong to that category.
    - Next if the input field is not empty, then the input text is matched with the name of the places from category filter. Matched places are showed as _Listings_. Even _Markers_ of unmatched places are removed from the map.
    - Input is also matched with category names of places if the category filter is set to '_All_'.
        - **Example:** _Typing in ``cafe`` will also match with ``Starbucks`` as it is of same category_ (only when category filter is set to '_All_').
    - Union of above two searches (place name search and category name search when category filter is set to '_All_') is finally displayed as _Listings_.
    - Special characters, spaces are ignored for convinience. All letters are converted to small-caps.
        - **Example:** _Typing in ``suesgall`` or ``sues gall`` or ``sue'sGall`` etc. will give same result ``Sue's Gallery Cafe``._
    - Even if the input is a middle word, it is matched.
        - **Example:** _Typing in ``hwy`` or ``h  w y`` etc. will give same result ``Cabrillo Hwy`` and ``Panaromic Hwy``._
10. Clicking anywhere on the map will close the info window of a place and also the side-bar (if it is open).

### Error detection

1. If **Google Maps API** is not loaded - checks after 5 seconds of Google maps callback function ``init_map()``.
2. If _API Keys_ are not found in [``secrets.json``](/secrets.json) file in [``root``](../../) folder.
3. If both ``secrets.json`` files are not found or couldn't be accessed.
4. If _database server_ couldn't be reached.
5. If **no** places are present in the response from the _database server_. Database might be empty.
6. **Google Street View Image API** service error inside info window of marker.
7. **Foursquare API _Search for Venues_** service data fetching error.
8. **Foursquare API _Venues_** service data fetching error.
9. If no place was found while searching for Foursquare data.
10. If no places (lisitngs) were found in the search (filter).

## Other details

- Styling file [``style.css``](/css/style.css) is in [``css``](/css/) folder.
- Images for _Marker_ icons are in [``images/marker_icons/flag``](/images/marker_icons/flag/) folder.
- **Screenshots** are in [``screenshots``](/screenshots/) folder.
- Address to my hosted app: [https://**rahulbethi**.com/**neighborhood_map**](https://rahulbethi.com/neighborhood_map)

### My Webpage
[https://**rahulbethi**.com](https://rahulbethi.com)

### My LinkedIn profile
[https://www.linkedin.com/**in/rahulbethi**](https://www.linkedin.com/in/rahulbethi)
