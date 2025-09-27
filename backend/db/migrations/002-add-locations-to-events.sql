-- 002-add-location-to-events.sql

ALTER TABLE events
ADD COLUMN latitude REAL; -- Using REAL for floating-point numbers

ALTER TABLE events
ADD COLUMN longitude REAL;

ALTER TABLE events
ADD COLUMN radius INTEGER; -- Storing the radius in meters