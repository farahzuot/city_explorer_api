DROP TABLE IF EXISTS location;

CREATE TABLE location(
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    YELP=OzqBW8iBBvU72rxL0MyVFDCTRVuSBD29ahJW4cXw1OXMhOI7Zxlb_3tHhWlTuLJ2xAR9C1lOkq1v6Ep7Q9Ursz2pmZni8dwnXZH2LRlalfHfS6YZI1qFVyMhYgCbX3Yx
);