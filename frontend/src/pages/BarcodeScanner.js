import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { codeReader } from "../utils/scanner";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import BusinessLayout from "../components/BusinessLayout";

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
            } catch (err) {
                console.error("Camera Error:", err);
            }
        }

        startScanner();

        return () => {
            if (controls) {
                controls.stop();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } catch (err) {
            console.log("API ERROR", err);
            if (err.response) {
                console.log(err.response.data);
            }
            localStorage.setItem("barcode", barcode);
            navigate("/add-product");
        }
    };

    return (
        <BusinessLayout>
            <div className="scanner-page-content">
                <div className="scanner-container">
                    <div className="scanner-header">
                        <h2 className="scanner-title">
                            📷 {t("Barcode / QR Scanner")}
                        </h2>
                        <p className="scanner-subtitle">
                            {t("Scan food product barcode to automatically populate details")}
                        </p>
                    </div>

                    <div className="scanner-card">
                        <div className="scanner-video-wrapper">
                            <video
                                ref={videoRef}
                                className="scanner-video"
                            />
                        </div>

                        <div className="scanner-field">
                            <label className="form-label fw-bold">
                                {t("Scanned Barcode / QR")}
                            </label>
                            <input
                                className="form-control form-control-lg text-center fw-semibold"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value.trim())}
                                placeholder={t("Waiting for scan...")}
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-lg w-100 mt-3"
                            disabled={!barcode}
                            onClick={useBarcode}
                        >
                            ✅ {t("Use Barcode")}
                        </button>
                    </div>
                </div>
            </div>
        </BusinessLayout>
    );
}

export default BarcodeScanner;
