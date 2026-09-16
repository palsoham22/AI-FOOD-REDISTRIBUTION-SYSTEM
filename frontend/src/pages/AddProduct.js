import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { saveOfflineProduct } from "../utils/offlineQueue";

function AddProduct() {

    const [product_name, setProductName] = useState("");
    const [category, setCategory] = useState("Dairy");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("Kg");
    const [expiry_date, setExpiryDate] = useState("");
    const [storage_type, setStorageType] = useState("Refrigerated");
    const navigate = useNavigate();
    const [barcode, setBarcode] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {

    const savedBarcode = localStorage.getItem("barcode");
    const savedProduct = localStorage.getItem("product_name");
    const savedCategory = localStorage.getItem("category");
    const savedImage = localStorage.getItem("image");

    if (savedBarcode) {
        setBarcode(savedBarcode);
    }

    if (savedProduct) {
        setProductName(savedProduct);
    }

    if (savedCategory) {
        setCategory(savedCategory);
    }

    if (savedImage) {
        setImage(savedImage);
    }

    }, []);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("access");

            // If internet is not available
if (!navigator.onLine) {

    saveOfflineProduct({

        product_name,
        barcode,
        brand: localStorage.getItem("brand") || "",
        image_url: image,
        category,
        quantity,
        unit,
        expiry_date,
        storage_type,
        status: "Available"

    });

    alert("📦 Product saved offline. It will sync automatically when internet is back.");

    // Register Background Sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {

        const registration = await navigator.serviceWorker.ready;

        await registration.sync.register("foodbridge-sync");

    }

    navigate("/business-dashboard");

    return;
}

            await axios.post(

    "http://127.0.0.1:8000/api/inventory/add/",

    {
    product_name,
    barcode,
    brand: localStorage.getItem("brand") || "",
    image_url: image,
    category,
    quantity,
    unit,
    expiry_date,
    storage_type,
    status: "Available"
    },

    {

        headers: {

            Authorization: `Bearer ${token}`

        }

    }

);

            alert("Product Added Successfully 🎉");

            localStorage.removeItem("barcode");
            localStorage.removeItem("product_name");
            localStorage.removeItem("brand");
            localStorage.removeItem("category");
            localStorage.removeItem("image");

            navigate("/business-dashboard");

        }

        catch (err) {

    console.log("FULL ERROR:", err);

    console.log("Response:", err.response);

    console.log("Response Data:", err.response?.data);

    alert(
        JSON.stringify(err.response?.data)
    );

}

    };

    return (

        <div className="container mt-5">

            <h2 className="mb-4">

    📦 Add New Product

</h2>

            <form onSubmit={handleSubmit}>

                <div className="mb-3">

    <label className="form-label">

        Barcode

    </label>

    <input

        type="text"

        className="form-control"

        value={barcode}

        readOnly

    />

</div>

{image && (

    <div className="mb-3 text-center">

        <img
            src={image}
            alt="Product"
            style={{
                width: "180px",
                height: "180px",
                objectFit: "contain",
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px"
            }}
        />

    </div>

)}

                <div className="mb-3">

    <label className="form-label">

        Product Name

    </label>

    <input
        type="text"
        className="form-control"
        placeholder="Enter Product Name"
        value={product_name}
        onChange={(e)=>setProductName(e.target.value)}
    />

</div>

                <div className="mb-3">

    <label className="form-label">

        Category

    </label>

    <select
        className="form-select"
        value={category}
        onChange={(e)=>setCategory(e.target.value)}
    >

        <option>Dairy</option>
        <option>Bakery</option>
        <option>Fruits</option>
        <option>Vegetables</option>
        <option>Other</option>

    </select>

</div>

                <div className="mb-3">

    <label className="form-label">

        Quantity

    </label>

    <input
        type="number"
        className="form-control"
        placeholder="Enter Quantity"
        value={quantity}
        onChange={(e)=>setQuantity(e.target.value)}
    />

</div>

                <div className="mb-3">

    <label className="form-label">

        Unit

    </label>

    <select
        className="form-select"
        value={unit}
        onChange={(e)=>setUnit(e.target.value)}
    >

        <option>Kg</option>
        <option>Litre</option>
        <option>Piece</option>
        <option>Packet</option>

    </select>

</div>

                <div className="mb-3">

    <label className="form-label">

        Expiry Date

    </label>

    <input
        type="date"
        className="form-control"
        value={expiry_date}
        onChange={(e)=>setExpiryDate(e.target.value)}
    />

</div>

                <div className="mb-3">

    <label className="form-label">

        Storage Type

    </label>

    <select
        className="form-select"
        value={storage_type}
        onChange={(e)=>setStorageType(e.target.value)}
    >

        <option>Refrigerated</option>
        <option>Frozen</option>
        <option>Room Temperature</option>

    </select>

</div>

                <button
    type="submit"
    className="btn btn-success w-100"
>

    💾 Save Product

</button>

            </form>

        </div>

    );

}

export default AddProduct;