# SQLAlchemy variables used in writing mapper code
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Float

# To use in configuration and class code
from sqlalchemy.ext.declarative import declarative_base

# To relate Foreign Key relationships
from sqlalchemy.orm import relationship

# To use in the configuration code at the end of configuration
from sqlalchemy import create_engine

# API to convert Python objects to JSON format or vice versa
import json

# Instance of the declarative base class
Base = declarative_base()
# ^^ Will let the SQLAlchemy know that out classes are special SQLAlchemy
#   classes that correspond to the tables in our database


# Classes (Tables)
class Listing(Base):
    __tablename__ = 'listing'

    id = Column(Integer, primary_key=True)
    name = Column(String(250), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    category = Column(String(100))
    description = Column(String(250))
    

    # Code to define what to send (in each listing) in JSON format
    @property
    def serialize(self):
        # Returns data in easily serializable format (like dictionary format)
        return {
            'id': self.id,
            'name': self.name,
            'location' : {'lat' : self.lat, 'lng' : self.lng,},
            'category' : self.category,
            'description': self.description
        }


user = json.loads(
        open('secrets.json', 'r').read()
    )["postgresql"]["user"]
password = json.loads(
        open('secrets.json', 'r').read()
    )["postgresql"]["password"]
database = json.loads(
        open('secrets.json', 'r').read()
    )["postgresql"]["database"]

# Instance of create engine class and point to database we use
engine = create_engine(
    'postgresql://{user}:{password}@localhost:5432/{database}'.format(
        user=user,
        password=password,
        database=database
    )
)

# This goes into database and creates all the classes we will soon create as
#   new tables
Base.metadata.create_all(engine)

if __name__ == '__main__':
    print("Database setup: completed")
