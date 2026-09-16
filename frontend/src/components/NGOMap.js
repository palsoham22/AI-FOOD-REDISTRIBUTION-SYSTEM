import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ChangeMapView({ position }) {
    const map = useMap();

    useEffect(() => {
        map.setView(position, 15);
    }, [position, map]);

    return null;
}

function NGOMap({ driverId }) {

    const [driver, setDriver] = useState(null);

    useEffect(() => {

        const token = localStorage.getItem("access");

        const loadLocation = async () => {

            try {

                const response = await axios.get(
                    `http://127.0.0.1:8000/api/delivery/location/${driverId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setDriver(response.data);

            } catch (error) {

                console.log(error);

            }

        };

        loadLocation();

        const interval = setInterval(loadLocation, 5000);

        return () => clearInterval(interval);

    }, [driverId]);

    if (!driver || driver.latitude === null || driver.longitude === null) {

        return (
            <h5 className="text-center">
                Waiting for driver's location...
            </h5>
        );

    }

    const position = [
        Number(driver.latitude),
        Number(driver.longitude)
    ];

    return (

        <MapContainer
            center={position}
            zoom={15}
            style={{
                height: "450px",
                width: "100%"
            }}
        >

            <ChangeMapView position={position} />

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>

                <Popup>

                    <b>{driver.username}</b>

                    <br />

                    {driver.availability}

                </Popup>

            </Marker>

        </MapContainer>

    );

}

export default NGOMap;