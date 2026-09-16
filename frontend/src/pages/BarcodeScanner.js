import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { codeReader } from "../utils/scanner";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function BarcodeScanner() {

    const videoRef = useRef(null);

    const navigate = useNavigate();

    const [barcode, setBarcode] = useState("8901262020015");

    const t = useTranslate();

    usePageTranslation(LABELS.BARCODE);

    useEffect(() => {

    // Clear previous scanned data
    setBarcode("");

    localStorage.removeItem("barcode");
    localStorage.removeItem("product_name");
    localStorage.removeItem("brand");
    localStorage.removeItem("category");
    localStorage.removeItem("image");

    let controls;

    async function startScanner() {

            try {

                controls = await codeReader.decodeFromVideoDevice(

                    null,

                    videoRef.current,

                    (result, error) => {

                        if (result) {

    const code = result.getText();

    if (barcode === code) return;

    console.log("SCANNED:", code);

    setBarcode(code);

}

                    }

                );

            }

            catch (err) {

                console.error("Camera Error:", err);

            }

        }

        startScanner();

        return () => {

            if (controls) {

                controls.stop();

            }

        };

    }, []);

    const useBarcode = async () => {

    console.log("========== BUTTON CLICKED ==========");
    console.log("Barcode:", barcode);

    try {

        const token = localStorage.getItem("access");

        console.log("Token:", token);

        const response = await axios.get(
            `http://127.0.0.1:8000/api/inventory/barcode/${barcode}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log("API Response:", response.data);

        localStorage.setItem("barcode", response.data.barcode);
        localStorage.setItem("product_name", response.data.product_name);
        localStorage.setItem("brand", response.data.brand);
        localStorage.setItem("category", response.data.category);
        localStorage.setItem("image", response.data.image);

        console.log("Saved to Local Storage");

        navigate("/add-product");

    }

    catch (err) {

        console.log("API ERROR");

        console.log(err);

        if (err.response) {
            console.log(err.response.data);
        }

        localStorage.setItem("barcode", barcode);

        navigate("/add-product");

    }

};

    return (

        <div className="container mt-5">

            <div className="card shadow p-4">

                <h2 className="mb-4">
    📷 {t("Barcode / QR Scanner")}
</h2>

                <video

                    ref={videoRef}

                    style={{
                        width: "100%",
                        maxWidth: "600px",
                        border: "2px solid black",
                        borderRadius: "10px"
                    }}

                />

                <div className="mt-4">

                    <label className="form-label">
    {t("Scanned Barcode / QR")}
</label>

                    <input

                        className="form-control"

                        value={barcode}

                        readOnly

                    />

                </div>

                <button

                    className="btn btn-success mt-3"

                    disabled={!barcode}

                    onClick={useBarcode}

                >

                    ✅ {t("Use Barcode")}

                </button>

            </div>

        </div>

    );

}

export default BarcodeScanner;