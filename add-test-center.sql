-- Add a test car wash center with coordinates
-- You can change the latitude/longitude to your location!

-- Example locations:
-- Paris: 48.8566, 2.3522
-- London: 51.5074, -0.1278
-- Los Angeles: 34.0522, -118.2437
-- Tokyo: 35.6762, 139.6503
-- Your location: Open Google Maps, right-click, and copy the coordinates!

INSERT INTO "Center" (
    id,
    name,
    description,
    address,
    city,
    state,
    "zipCode",
    phone,
    email,
    "openTime",
    "closeTime",
    capacity,
    latitude,
    longitude,
    amenities,
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'test-center-local',
    'Local Test Wash',
    'Test car wash near your location',
    '123 Test Street',
    'YourCity',
    'YourState',
    '12345',
    '+1-555-TEST',
    'test@carwash.com',
    '08:00',
    '20:00',
    5,
    48.8566,  -- Change to YOUR latitude
    2.3522,   -- Change to YOUR longitude
    ARRAY['WiFi', 'Waiting Area']::text[],
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    "updatedAt" = NOW();
