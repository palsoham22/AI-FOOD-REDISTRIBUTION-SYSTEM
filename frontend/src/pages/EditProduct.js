import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditProduct() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [product_name, setProductName] = useState("");

    const [category, setCategory] = useState("");

    const [quantity, setQuantity] = useState("");

    const [unit, setUnit] = useState("");

    const [expiry_date, setExpiryDate] = useState("");

    const [storage_type, setStorageType] = useState("");

    useEffect(() => {

    const token = localStorage.getItem("access");

    axios.get(

        "http://127.0.0.1:8000/api/inventory/list/",

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    )
    .then((response) => {

        const product = response.data.find(
            (item) => item.id === parseInt(id)
        );

        if (product) {

            setProductName(product.product_name);
            setCategory(product.category);
            setQuantity(product.quantity);
            setUnit(product.unit);
            setExpiryDate(product.expiry_date);
            setStorageType(product.storage_type);

        }

    })
    .catch((err) => {

        console.log(err);

    });

}, [id]);

    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("access");

await axios.put(

    `http://127.0.0.1:8000/api/inventory/update/${id}/`,

    {

        product_name,
        category,
        quantity,
        unit,
        expiry_date,
        storage_type,
        status:"Available"

    },

    {

        headers:{

            Authorization:`Bearer ${token}`

        }

    }

);

            alert("Product Updated Successfully 🎉");

            navigate("/business-dashboard");

        }

        catch (err) {

    console.log(err.response?.data);

    alert(JSON.stringify(err.response?.data));

}

    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-7">

                    <div className="card shadow">

                        <div className="card-body">

                            <h2 className="mb-4">

                                ✏ Edit Product

                            </h2>

                            <form onSubmit={handleUpdate}>

                                <div className="mb-3">

                                    <label>Product Name</label>

                                    <input

                                        className="form-control"

                                        value={product_name}

                                        onChange={(e)=>setProductName(e.target.value)}

                                    />

                                </div>

                                <div className="mb-3">

                                    <label>Category</label>

                                    <select

                                        className="form-select"

                                        value={category}

                                        onChange={(e)=>setCategory(e.target.value)}

                                    >

                                        <option>Dairy</option>

                                        <option>Bakery</option>

                                        <option>Fruits</option>

                                        <option>Vegetables</option>

                                    </select>

                                </div>

                                <div className="mb-3">

                                    <label>Quantity</label>

                                    <input

                                        type="number"

                                        className="form-control"

                                        value={quantity}

                                        onChange={(e)=>setQuantity(e.target.value)}

                                    />

                                </div>

                                <div className="mb-3">

                                    <label>Unit</label>

                                    <select

                                        className="form-select"

                                        value={unit}

                                        onChange={(e)=>setUnit(e.target.value)}

                                    >

                                        <option>Kg</option>

                                        <option>Piece</option>

                                        <option>Packet</option>

                                        <option>Litre</option>

                                    </select>

                                </div>

                                <div className="mb-3">

                                    <label>Expiry Date</label>

                                    <input

                                        type="date"

                                        className="form-control"

                                        value={expiry_date}

                                        onChange={(e)=>setExpiryDate(e.target.value)}

                                    />

                                </div>

                                <div className="mb-3">

                                    <label>Storage Type</label>

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

                                    className="btn btn-primary w-100"

                                >

                                    💾 Update Product

                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default EditProduct;