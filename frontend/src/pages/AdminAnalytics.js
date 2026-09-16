import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line
} from "recharts";

import AdminSidebar from "../components/AdminSidebar";
import TopNavbar from "../components/TopNavbar";

function AdminAnalytics() {

    const [analytics, setAnalytics] = useState({});
    const t = useTranslate();

    usePageTranslation(LABELS.ADMIN_ANALYTICS);

    useEffect(() => {

    const token = localStorage.getItem("access");

    axios.get(
        "http://127.0.0.1:8000/api/inventory/admin/analytics/",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    .then((response) => {

        setAnalytics(response.data);

    })
    .catch((error) => {

        console.log(error);

    });

}, []);


const pieData = [

    {
        name: t("Accepted"),
        value: analytics.accepted || 0
    },

    {
        name: t("Scheduled"),
        value: analytics.scheduled || 0
    },

    {
        name: t("Delivered"),
        value: analytics.delivered || 0
    },

    {
        name: t("Pending"),
        value: analytics.pending || 0
    }

];

const COLORS = [

    "#28a745",
    "#ffc107",
    "#0d6efd",
    "#dc3545"

];

const barData = [

    {
        name: t("Businesses"),
        count: analytics.businesses || 0
    },

    {
        name: t("NGOs"),
        count: analytics.ngos || 0
    },

    {
        name: t("Delivery"),
        count: analytics.delivery || 0
    },

    {
        name: t("Products"),
        count: analytics.products || 0
    }

];

const lineData = [

    {
        stage: t("Accepted"),
        value: analytics.accepted || 0
    },

    {
        stage: t("Scheduled"),
        value: analytics.scheduled || 0
    },

    {
        stage: t("Delivered"),
        value: analytics.delivered || 0
    }

];
    return (
        <>
            <AdminSidebar />

            <div
                className="container-fluid"
                style={{
                    marginLeft: "260px",
                    width: "calc(100% - 260px)",
                    padding: "30px"
                }}
            >
                <TopNavbar />

                <div className="mt-4">

    <h1 className="fw-bold">
        📊 {t("Analytics Dashboard")}
    </h1>

    <p className="text-muted">
        {t("Monitor platform performance and donation insights.")}
    </p>

    {/* Statistics Cards */}

    <div className="row mt-4">

        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card shadow border-0">
                <div className="card-body text-center">
                    <h6>{t("Total Businesses")}</h6>
                    <h2 className="text-primary">{analytics.businesses}</h2>
                </div>
            </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card shadow border-0">
                <div className="card-body text-center">
                    <h6>{t("Total NGOs")}</h6>
                    <h2 className="text-success">{analytics.ngos}</h2>
                </div>
            </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card shadow border-0">
                <div className="card-body text-center">
                    <h6>{t("Products")}</h6>
                    <h2 className="text-warning">{analytics.products}</h2>
                </div>
            </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card shadow border-0">
                <div className="card-body text-center">
                    <h6>{t("Delivery Partners")}</h6>
                    <h2 className="text-danger">{analytics.delivery}</h2>
                </div>
            </div>
        </div>

    </div>

    <div className="row">

        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card shadow border-0">
                <div className="card-body text-center">
                    <h6>{t("Accepted")}</h6>
                    <h2 className="text-success">{analytics.accepted}</h2>
                </div>
            </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card shadow border-0">
                <div className="card-body text-center">
                    <h6>{t("Scheduled")}</h6>
                    <h2 className="text-warning">{analytics.scheduled}</h2>
                </div>
            </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card shadow border-0">
                <div className="card-body text-center">
                    <h6>{t("Delivered")}</h6>
                    <h2 className="text-primary">{analytics.delivered}</h2>
                </div>
            </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card shadow border-0">
                <div className="card-body text-center">
                    <h6>{t("Pending")}</h6>
                    <h2 className="text-danger">{analytics.pending}</h2>
                </div>
            </div>
        </div>

    </div>

    {/* Charts */}

    <div className="row mt-4">

        <div className="col-lg-6 mb-4">

            <div className="card shadow">

                <div className="card-body">

                    <h5 className="mb-3">
                        🥧 {t("Donation Status")}
                    </h5>

                    <ResponsiveContainer width="100%" height={300}>

                        <PieChart>

                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                            >

                                {pieData.map((entry, index) => (

                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />

                                ))}

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>

        <div className="col-lg-6 mb-4">

            <div className="card shadow">

                <div className="card-body">

                    <h5 className="mb-3">
                        📊 {t("Platform Overview")}
                    </h5>

                    <ResponsiveContainer width="100%" height={300}>

                        <BarChart data={barData}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="name" />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Bar
                                dataKey="count"
                                fill="#0d6efd"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>

    </div>

    <div className="row">

        <div className="col-lg-12">

            <div className="card shadow">

                <div className="card-body">

                    <h5 className="mb-3">
                        📈 {t("Donation Progress")}
                    </h5>

                    <ResponsiveContainer width="100%" height={350}>

                        <LineChart data={lineData}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="stage" />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#198754"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>

    </div>

</div>

            </div>
        </>
    );
}

export default AdminAnalytics;