import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function DriverMap() {

    const [position, setPosition] = useState([22.5726, 88.3639]);

    useEffect(() => {

        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(

            (pos) => {

                setPosition([
                    pos.coords.latitude,
                    pos.coords.longitude
                ]);

            },

            (err) => console.log(err),

            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            }

        );

        return () => navigator.geolocation.clearWatch(watchId);

    }, []);

    return (

        <MapContainer
            center={position}
            zoom={15}
            style={{
                height: "450px",
                width: "100%",
                borderRadius: "10px",
            }}
        >

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>

                <Popup>

                    🚚 Delivery Partner <br />

                    Live Location

                </Popup>

            </Marker>

        </MapContainer>

    );

}

export default DriverMap;