import { useEffect, useState } from "react";
import axios from "axios";
import BusinessLayout from "../components/BusinessLayout";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/Analytics.css";

import {

PieChart,
Pie,
Cell,
ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
Legend,
CartesianGrid,
LineChart,
Line

} from "recharts";

function Analytics() {

    const [products, setProducts] = useState([]);

    const t = useTranslate();

    usePageTranslation(LABELS.ANALYTICS);

    useEffect(() => {

        const token = localStorage.getItem("access");

        axios.get(

            "http://127.0.0.1:8000/api/inventory/list/",

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        )

        .then((response)=>{

            const items = Array.isArray(response.data) ? response.data : [];
            setProducts(items);

        });

    }, []);

    const today = new Date();

    const nearExpiry = products.filter(product=>{

        const expiry = new Date(product.expiry_date);

        const diff = Math.ceil(

            (expiry-today)/(1000*60*60*24)

        );

        return diff>=0 && diff<=5;

    });

    const donated = products.filter(

        p=>p.status==="Donated"

    );

    const accepted = products.filter(

        p=>p.status==="Accepted"

    );

    const dairy = products.filter(

        p=>p.category==="Dairy"

    ).length;

    const bakery = products.filter(

        p=>p.category==="Bakery"

    ).length;

    const fruits = products.filter(

        p=>p.category==="Fruits"

    ).length;

    const vegetables = products.filter(

        p=>p.category==="Vegetables"

    ).length;

    const others = products.filter(

        p=>p.category==="Others"

    ).length;


    const pieData = [
    { name: t("Dairy"), value: dairy },
    { name: t("Bakery"), value: bakery },
    { name: t("Fruits"), value: fruits },
    { name: t("Vegetables"), value: vegetables },
    { name: t("Others"), value: others }
];

const COLORS = [
    "#2563EB",
    "#0284C7",
    "#F59E0B",
    "#DC2626",
    "#8B5CF6"
];

const barData = [
    { category: t("Dairy"), products: dairy },
    { category: t("Bakery"), products: bakery },
    { category: t("Fruits"), products: fruits },
    { category: t("Vegetables"), products: vegetables },
    { category: t("Others"), products: others }
];

const lineData = [
    { name: t("Products"), value: products.length },
    { name: t("Near Expiry"), value: nearExpiry.length },
    { name: t("Donated"), value: donated.length },
    { name: t("Accepted"), value: accepted.length }
];

    return (
        <BusinessLayout>
            <div className="analytics-page-content">

    <div className="analytics-header">

        <div>

            <h2 className="analytics-title">

                📈 {t("Analytics Dashboard")}

            </h2>

            <p className="analytics-subtitle">

                {t("Monitor inventory performance and donation insights.")}

            </p>

        </div>

    </div>

{/* KPI CARDS */}

<div className="analytics-cards">

<div className="analytics-card">

<h6>{t("Total Products")}</h6>

<h2>{products.length}</h2>

</div>

<div className="analytics-card">

<h6>{t("Near Expiry")}</h6>

<h2>{nearExpiry.length}</h2>

</div>

<div className="analytics-card">

<h6>{t("Donated")}</h6>

<h2>{donated.length}</h2>

</div>

<div className="analytics-card">

<h6>{t("Accepted")}</h6>

<h2>{accepted.length}</h2>

</div>

</div>

{/* CHARTS */}

<div className="chart-grid">

{/* PIE */}

<div className="chart-card">

<h5>

🥧 {t("Category Distribution")}

</h5>

<ResponsiveContainer

width="100%"

height={320}

>

<PieChart>

<Pie

data={pieData}

dataKey="value"

nameKey="name"

outerRadius={110}

label

>

{

pieData.map((entry,index)=>(

<Cell

key={index}

fill={COLORS[index % COLORS.length]}

/>

))

}

</Pie>

<Tooltip/>

<Legend/>

</PieChart>

</ResponsiveContainer>

</div>

{/* BAR */}

<div className="chart-card">

<h5>

📊 {t("Inventory By Category")}

</h5>

<ResponsiveContainer

width="100%"

height={320}

>

<BarChart data={barData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="category"/>

<YAxis/>

<Tooltip/>

<Legend/>

<Bar

dataKey="products"

fill="#198754"

radius={[8,8,0,0]}

/>

</BarChart>

</ResponsiveContainer>

</div>

</div>

        {/* LINE CHART */}

<div className="line-chart">

<div className="chart-card">

<h5>

📈 {t("Inventory Overview")}

</h5>

<ResponsiveContainer

width="100%"

height={350}

>

<LineChart data={lineData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>

<Legend/>

<Line

type="monotone"

dataKey="value"

stroke="#198754"

strokeWidth={4}

dot={{ r:6 }}

activeDot={{ r:8 }}

/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

{/* PROGRESS */}

<div className="progress-card">

<h5 className="mb-4">

📊 {t("Inventory Progress")}

</h5>

<p>

{t("Donated Products")}

</p>

<div className="progress mb-4">

<div

className="progress-bar bg-success"

style={{

width:`${products.length===0

?0

:(donated.length/products.length)*100}%`

}}

>

{donated.length}

</div>

</div>

<p>

{t("Accepted Products")}

</p>

<div className="progress mb-4">

<div

className="progress-bar bg-primary"

style={{

width:`${products.length===0

?0

:(accepted.length/products.length)*100}%`

}}

>

{accepted.length}

</div>

</div>

<p>

{t("Near Expiry Products")}

</p>

<div className="progress">

<div

className="progress-bar bg-warning"

style={{

width:`${products.length===0

?0

:(nearExpiry.length/products.length)*100}%`

}}

>

{nearExpiry.length}

</div>

</div>

</div>

{/* QUICK INSIGHTS */}

<div className="chart-card mt-4">

<h5>

💡 {t("Quick Insights")}

</h5>

<hr/>

<div className="row">

<div className="col-md-6">

<p>

✅ <strong>{products.length}</strong> {t("Products Currently Available")}

</p>

<p>

🎁 <strong>{donated.length}</strong> {t("Products Donated")}

</p>

</div>

<div className="col-md-6">

<p>

⚠ <strong>{nearExpiry.length}</strong> {t("Products Near Expiry")}

</p>

<p>

🤝 <strong>{accepted.length}</strong> {t("Products Accepted")}

</p>

</div>

</div>

</div>
            </div>
        </BusinessLayout>
    );
}

export default Analytics;