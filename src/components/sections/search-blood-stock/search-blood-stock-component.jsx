import { useState, useEffect } from "react";
import { Icon } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import GroupedHeadingComponent from "../grouped-heading/grouped-heading-component";
import WrapperSection from "../wrapper-section/wrapper-section-component";
import "./search-blood-stock.css";
import axios from "axios";
import L from 'leaflet';

// Custom icons using PNG files from public directory
const bloodBankIcon = new Icon({
  iconUrl: "/blood-bank-marker.png", // Add this PNG to public/markers/
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to handle map bounds and zoom
const MapController = ({ bounds, center, shouldZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
        animate: true,
        duration: 1.5,
      });
    }
  }, [bounds, map]);

  useEffect(() => {
    if (center && shouldZoom) {
      map.flyTo(center, 14, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [center, shouldZoom, map]);

  return null;
};

// Add this new component for handling user location
const LocationMarker = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  const userLocationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

const SearchBloodStockComponent = ({
  subheadingText,
  headingText,
  classHint,
}) => {
  const [bloodGroup, setBloodGroup] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPosition, setCurrentPosition] = useState([31.7917, -7.0926]); // Morocco center
  const [bloodBanks, setBloodBanks] = useState([]); // This would be populated from your API
  const [selectedBank, setSelectedBank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyBanks, setNearbyBanks] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const initialZoom = 7;
  const [shouldZoomToUser, setShouldZoomToUser] = useState(false);

  const handleLocationClick = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setCurrentPosition(newPosition);
          setShouldZoomToUser(true);
          // Add a minimum loading time of 1 second
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
          alert(
            "Unable to find your location. Please check your browser settings."
          );
        }
      );
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Add handler for marker click
  const handleMarkerClick = (bank) => {
    setSelectedBank(bank);
  };

  // Add handler to close info panel
  const handleCloseInfo = () => {
    setSelectedBank(null);
  };

  // Fetch blood banks based on filters
  const fetchBloodBanks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (bloodGroup) params.append("bloodType", bloodGroup);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(
        `http://localhost:3001/api/blood-banks?${params}`
      );

      // Debug log to check all blood banks
      console.log("All blood banks:", response.data.data);

      // Verify coordinates for each blood bank
      response.data.data.forEach((bank, index) => {
        console.log(`Bank ${index + 1}: ${bank.name}`, {
          latitude: bank.latitude,
          longitude: bank.longitude,
          isValidLat: bank.latitude >= -90 && bank.latitude <= 90,
          isValidLng: bank.longitude >= -180 && bank.longitude <= 180,
        });
      });

      if (response.data && response.data.data) {
        setBloodBanks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching blood banks:", error);
      setBloodBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch blood banks when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBloodBanks();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [bloodGroup, searchQuery]);

  // Update map markers when bloodBanks changes
  useEffect(() => {
    if (selectedBank) {
      const bankStillExists = bloodBanks.find(
        (bank) => bank._id === selectedBank._id
      );
      if (!bankStillExists) {
        setSelectedBank(null);
      }
    }
  }, [bloodBanks]);

  // Add initial data fetch when component mounts
  useEffect(() => {
    fetchBloodBanks();
  }, []);

  // Add console logs for debugging
  useEffect(() => {
    console.log("Current blood banks:", bloodBanks);
  }, [bloodBanks]);

  useEffect(() => {
    console.log("Selected bank:", selectedBank);
  }, [selectedBank]);

  // Calculate bounds for filtered results
  const calculateBounds = (banks) => {
    if (!banks || banks.length === 0) return null;

    const lats = banks.map((bank) => bank.latitude);
    const lngs = banks.map((bank) => bank.longitude);

    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  };

  // Handle filtering
  useEffect(() => {
    if (bloodBanks && bloodBanks.length > 0) {
      const filtered = bloodBanks.filter((bank) => {
        if (bloodGroup) return bank.availableBloodTypes.includes(bloodGroup);
        return true;
      });
      setFilteredBanks(filtered);
      const newBounds = calculateBounds(filtered);
      setMapBounds(newBounds);
    }
  }, [bloodGroup, bloodBanks]);

  return (
    <WrapperSection>
      <div
        className={`${classHint} bg-off_white wrapper flex flex-col justify-center items-center w-full relative p-6 py-10 sm:py-20 sm:p-20 rounded-rmd z-[25] overflow-hidden`}
      >
        <GroupedHeadingComponent
          subheadingText={subheadingText}
          headingText={headingText}
          mode="dark"
          position="center"
        />

        <div className="w-full mt-10">
          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row gap-4 w-full mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search blood banks..."
                className="w-full px-4 py-3 border-none bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-dark_red/50 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <select
                name="bloodGroup"
                className="w-full px-4 py-3 appearance-none bg-white border border-gray-200 rounded-xl shadow-md 
                focus:outline-none focus:ring-2 focus:ring-dark_red/50 focus:border-dark_red/50 cursor-pointer 
                transition-all duration-300 hover:border-dark_red/30 text-gray-700"
                onChange={(e) => setBloodGroup(e.target.value)}
                value={bloodGroup}
              >
                <option value="" disabled hidden>
                  Select Blood Group
                </option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Location Button with Loading State */}
            <button
              onClick={handleLocationClick}
              disabled={isLoading}
              className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                isLoading ? "bg-gray-400" : "bg-dark_red hover:bg-red-900"
              } text-white shadow-md transition-all duration-300`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Map and Info Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2 h-[600px] rounded-xl overflow-hidden shadow-lg">
              <MapContainer
                center={[31.7917, -7.0926]}
                zoom={initialZoom}
                style={{ height: "100%", width: "100%" }}
                className="z-10"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapController
                  bounds={mapBounds}
                  center={currentPosition}
                  shouldZoom={shouldZoomToUser}
                />

                {bloodBanks &&
                  bloodBanks.map((bank) => (
                    <Marker
                      key={bank._id}
                      position={[bank.latitude, bank.longitude]}
                      icon={bloodBankIcon}
                      eventHandlers={{
                        click: () => handleMarkerClick(bank),
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-3">
                          <h3 className="font-semibold text-dark_red">
                            {bank.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bank.address}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {bank.availableBloodTypes.map((type) => (
                              <span
                                key={type}
                                className="px-2 py-1 text-xs bg-red-50 text-dark_red rounded"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                <LocationMarker />
              </MapContainer>
            </div>

            {/* Enhanced Info Section */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
              {selectedBank ? (
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="bg-dark_red p-6 text-white">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold">{selectedBank.name}</h3>
                      <button
                        onClick={handleCloseInfo}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-white/80 mt-2">
                      {selectedBank.city}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Location Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Location
                      </h4>
                      <div className="flex items-start space-x-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-dark_red mt-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-gray-700">{selectedBank.address}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Contact
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-dark_red"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <p className="text-gray-700">{selectedBank.phone}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-dark_red"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          <p className="text-gray-700">{selectedBank.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Available Blood Types */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Available Blood Types
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBank.availableBloodTypes.map((type, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                              bloodGroup === type
                                ? "bg-dark_red text-white"
                                : "bg-red-50 text-dark_red border border-red-100"
                            }`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-dark_red"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">
                      Select a blood bank on the map
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Click any marker to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-dark_red border-t-transparent"></div>
        </div>
      )}
    </WrapperSection>
  );
};

export default SearchBloodStockComponent;