import NGOSidebar from "../components/NGOSidebar";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import NGOMap from "../components/NGOMap";
import { useTranslate } from "../hooks/useTranslate";
import "../styles/PickupSchedule.css";


function PickupSchedule() {

    const { id } = useParams();

    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [volunteerName, setVolunteerName] = useState("");
    const [driverStatus, setDriverStatus] = useState("");
    const [recommendedVehicle, setRecommendedVehicle] = useState("");
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("");
    const [storageType, setStorageType] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [driverVehicleNumber, setDriverVehicleNumber] = useState("");
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [driverId, setDriverId] = useState(null);

    const t = useTranslate();

    useEffect(() => {

    const fetchDonation = async () => {

        const token = localStorage.getItem("access");

        try {

            const res = await axios.get(
                `http://127.0.0.1:8000/api/inventory/schedule/${id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProductName(res.data.product_name);
            setCategory(res.data.category);
            setQuantity(res.data.quantity);
            setStorageType(res.data.storage_type);
            setRecommendedVehicle(res.data.recommended_vehicle);

        } catch (error) {

            console.log(error);

        }

    };

    const fetchDeliveryPartners = async () => {

        const token = localStorage.getItem("access");

        try {

            const res = await axios.get(
                "http://127.0.0.1:8000/api/available-delivery-partners/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDeliveryPartners(res.data);

        }

        catch(error){

            console.log(error);

        }

    };

    fetchDonation();

    fetchDeliveryPartners();

}, [id]);

    const saveSchedule = async () => {

    const token = localStorage.getItem("access");

    try {

        const response = await axios.post(

            `http://127.0.0.1:8000/api/inventory/schedule/${id}/`,

            {

                pickup_date: pickupDate,

                pickup_time: pickupTime,

                volunteer_name: volunteerName,

                vehicle_number: driverVehicleNumber,

            },

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        alert(
`Pickup Scheduled Successfully!

Pickup OTP: ${response.data.pickup_otp}

Delivery OTP: ${response.data.delivery_otp}`
);

    }

    catch(error){

        console.log(error);

        alert(t("Scheduling Failed"));

    }

};

    return (

<>

<NGOSidebar/>

<div className="pickup-page">

<div className="pickup-header">

<div>

<h2 className="pickup-title">

🚚 {t("Pickup Schedule")}

</h2>

<p className="pickup-subtitle">

Schedule a pickup for the accepted donation.

</p>

</div>

</div>

<form>

{/* Recommended Vehicle */}

<div className="vehicle-card">

<h4>

🚛 {t("Recommended Vehicle")}

</h4>

<hr className="border-light"/>

<div className="row">

<div className="col-md-6">

<p>

<strong>

📦 {t("Product")}:

</strong>

{productName}

</p>

<p>

<strong>

🏷 {t("Category")}:

</strong>

{category}

</p>

</div>

<div className="col-md-6">

<p>

<strong>

📊 {t("Quantity")}:

</strong>

{quantity}

</p>

<p>

<strong>

❄ {t("Storage")}:

</strong>

{storageType}

</p>

</div>

</div>

<h3 className="mt-3">

🚚 {recommendedVehicle || "Calculating..."}

</h3>

</div>

<div className="pickup-card">

<div className="row">

<div className="col-md-6 mb-3">

<label>

📅 {t("Pickup Date")}

</label>

<input

type="date"

className="form-control"

value={pickupDate}

onChange={(e)=>setPickupDate(e.target.value)}

/>

</div>

<div className="col-md-6 mb-3">

<label>

🕒 {t("Pickup Time")}

</label>

<input

type="time"

className="form-control"

value={pickupTime}

onChange={(e)=>setPickupTime(e.target.value)}

/>

</div>

</div>

<div className="mb-4">

<label>

👤 {t("Select Delivery Partner")}

</label>

<select

className="form-select"

value={volunteerName}

onChange={(e)=>{

const selected=e.target.value;

setVolunteerName(selected);

const partner=deliveryPartners.find(

(p)=>p.username===selected

);

if(partner){

setDriverId(partner.id);

setDriverStatus("🟢 Available");

setVehicleType(partner.vehicle_type||"Not Assigned");

setDriverVehicleNumber(

partner.vehicle_number||"Not Assigned"

);

}else{

setDriverStatus("");

setVehicleType("");

setDriverVehicleNumber("");

}

}}

>

<option value="">

-- {t("Select Delivery Partner")} --

</option>

{

deliveryPartners.map((partner)=>(

<option

key={partner.id}

value={partner.username}

>

{partner.username} 🟢

</option>

))

}

</select>

</div>

{

vehicleType && (

<div className="driver-card mb-4">

<div className="card-header">

🚚 {t("Assigned Delivery Partner")}

</div>

<div className="card-body">

<div className="row">

<div className="col-md-6">

<p>

<strong>

👤 {t("Volunteer")}:

</strong>

{volunteerName}

</p>

<p>

<strong>

🟢 {t("Status")}:

</strong>

{driverStatus}

</p>

</div>

<div className="col-md-6">

<p>

<strong>

🚛 {t("Vehicle Type")}:

</strong>

{vehicleType}

</p>

<p>

<strong>

🔢 {t("Vehicle Number")}:

</strong>

{driverVehicleNumber}

</p>

</div>

</div>

</div>

</div>

)

}

{

driverId && (

<div className="map-card mb-4">

<div className="card-header">

🗺️ {t("Live Driver Tracking")}

</div>

<div className="card-body">

<NGOMap driverId={driverId} />

</div>

</div>

)

}

<div className="pickup-card">

<div className="mb-4">

<label>

🚚 {t("Vehicle Number")}

</label>

<input

type="text"

className="form-control"

value={driverVehicleNumber}

readOnly

/>

</div>

<button

type="button"

className="btn btn-primary save-btn"

onClick={saveSchedule}

>

💾 {t("Save Pickup Schedule")}

</button>

</div>

</div>

</form>

</div>

</>

);

}

export default PickupSchedule;