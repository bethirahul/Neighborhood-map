# My Neighborhood Map

This is my Neighborhood map _(web app)_, built by _**Rahul Bethi**_.

It shows some of the places I love in _Bay area, California_.

It uses [**Google Maps API**](https://developers.google.com/maps/) to show a customized map, with my favorite places as markers on the map. Click the markers to get more info of the places. Google Street view near the place. [**Foursquare API**](https://developer.foursquare.com/) is used to get more info about Cafés. All these places can be searched and filtered by category.

This app uses a **PostgreSQL database** and **Python server** to get the places in JSON format. It then processes this data and shows them as markers on the map.

## Built using

- **HTML**, **Javascript**, [**Knockout JS**](http://knockoutjs.com/downloads/index.html) v3.4.2 _(organizational framework)_, [**Google Maps API**](https://developers.google.com/maps/) v3.31, [**Foursquare API**](https://developer.foursquare.com/) v2 20170801.
- [**Python**](https://www.python.org/downloads/) v3.6.4 _(web server)_, [**PostgreSQL**](https://www.postgresql.org/download/) v10.3 _(database)_.

## Instructions to run

1. Install database software - [**PostgreSQL**](https://www.postgresql.org/download/) v10.3.
2. Install [**Python**](https://www.python.org/downloads/) v3.6.4, and then ``pip install``:
    - ``flask``
    - ``sqlalchemy``
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
    - You can check the database output at [http://localhost:5000/listings/json](http://localhost:5000/listings/json).
5. Get a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) and a [Foursquare API Client ID and Client Secret](https://foursquare.com/developers/login?continue=%2Fdevelopers%2Fapps).
    - For Google - Create a project and add [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/) and [Google Street View Image API](https://developers.google.com/maps/documentation/streetview/) to your project.
6. Make a new json file named ``secrets.json`` in the [``root``](/) folder.
    - Fill out the JSON file with the [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) and [Foursquare API Client details](https://foursquare.com/developers/login?continue=%2Fdevelopers%2Fapps).
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
