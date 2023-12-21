import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import axios from "axios";
import AddressForm from "./AddressForm";
import "../../public/Map.css";
import {Link} from "react-router-dom";

const libraries = ["places"];

const Map = ({apartments = []}) => {
    const [center, setCenter] = useState({ lat: 40.745067, lng: -70.024408}); //default near hoboken
    const [markers, setMarkers] = useState([]); //will use to store markers for each apartment
    const [selectedMarker, setSelectedMarker] = useState(null);

    // Convert addresses to lat/lng
    const geocode = async (inputAddress) => {
        const parsedAddress = inputAddress.split(' ').join('%20');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        try {
            // Send a POST request to Google's address validation API
            const response = await axios.post(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${parsedAddress}&components=country:US&key=${apiKey}`
            );
            if(response.status === 200){
                return response.data.results[0].geometry.location
            }
            else{
                console.log("Error retrieving geocode for address", inputAddress);
                return null;
            }
        } catch (error) {
            // Handle errors during address validation
            console.error(`Error retrieving geocode for address ${inputAddress}`, error);
        }
    };

    useEffect(() => {
        const apartmentAddresses = apartments.map((apartment) => {
            return apartment.address;
        });
        const fetchGeocodes = async () => {
            const geocodePromises = apartmentAddresses.map(async (address) => {
                return await geocode(address);
            });
        
            // Use Promise.all to wait for all geocoding promises to resolve
            const resolvedGeocodes = await Promise.all(geocodePromises);
            setMarkers(resolvedGeocodes);
        };
    
        fetchGeocodes();
    }, [apartments]);    
    
    useEffect(() => {
        const success = (position) => {
            setCenter({ lat: position.coords.latitude, lng: position.coords.longitude});
        }
        const error = () => {
            console.log("Unable to retrieve your location");
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true});
        } 
        else {
            console.log("Geolocation not supported");
        }
    }, []);


    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });
    
    if (loadError) {
        console.log("error", loadError)
        return <div>Error loading map</div>;
    }
    
    if (!isLoaded) {
        return <div>Loading map</div>;
    }

    const updateCoords = ({lat, lng}) => { //change map center to user input address
        setCenter({lat, lng});
    }

    const handleMarkerClick = (markerIndex) => {
        setSelectedMarker(markerIndex);
    };

    const closeInfoWindow = () => {
        setSelectedMarker(null);
    };

    return (
        <div className="Map">
            {!isLoaded ? (
                <h1>Loading Map...</h1>
            ) :  markers.length !== 0 && (
                <>
                <AddressForm returnCoords={updateCoords} mapCenter={center} />
                <GoogleMap mapContainerClassName="map-container" center={center} zoom={15}>
                    {markers.map((marker, index) => 
                        <Marker
                            key={index}
                            position={marker}
                            onClick={() => handleMarkerClick(index)}
                        />
                    )}

                    {selectedMarker && (
                    <InfoWindow
                        position={markers[selectedMarker]}
                        onCloseClick={closeInfoWindow}
                    >
                        { selectedMarker &&
                            <div>
                                <Link to={`/apartment/${apartments[selectedMarker].id}`}>
                                    <p><b>{apartments[selectedMarker].name}</b></p>
                                    <p>{apartments[selectedMarker].address}</p>
                                </Link>
                                <p>Landlord: {apartments[selectedMarker].landlord.name}</p>
                                <p>Rent: ${apartments[selectedMarker].price}/mo</p>
                            </div>
                        }
                        
                    </InfoWindow>
                    )}
                </GoogleMap>
                </>
            )}
        </div>
    );
};

export default Map;