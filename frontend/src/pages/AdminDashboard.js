import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import DashboardCard from "../components/DashboardCard";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AdminDashboard.css";

function AdminDashboard() {

    const [stats, setStats] = useState({

        total_users: 0,
        businesses: 0,
        ngos: 0,
        delivery_partners: 0,
        products: 0,
        donated: 0,
        accepted: 0,
        scheduled: 0,
        delivered: 0

    });

    const [selectedCard, setSelectedCard] = useState(null);

    const t = useTranslate();

    const { language } = useTranslationContext();

    const navigate = useNavigate();

    usePageTranslation(LABELS.ADMIN_DASHBOARD);

    useEffect(() => {

        const token = localStorage.getItem("access");

        axios.get(
            "http://127.0.0.1:8000/api/inventory/admin-dashboard/",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then((response) => {

            setStats(response.data);

        })
        .catch((error) => {

            console.log(error);

        });

    }, []);

    const dashboardCards = [

{
title:"🏢 Registered Businesses",
value:stats.businesses,
color:"#16a34a",
description:"Total businesses registered on the platform."
},

{
title:"🤝 Registered NGOs",
value:stats.ngos,
color:"#2563eb",
description:"Total NGOs connected with FoodBridge AI."
},

{
title:"📦 Total Inventory Items",
value:stats.products,
color:"#f97316",
description:"Products currently managed in inventory."
},

{
title:"🎁 Accepted Donations",
value:stats.accepted,
color:"#8b5cf6",
description:"Donations accepted by NGOs."
},

{
title:"👥 Platform Users",
value:stats.total_users,
color:"#dc2626",
description:"Registered users across all roles."
},

{
title:"🚚 Active Delivery Partners",
value:stats.delivery_partners,
color:"#06b6d4",
description:"Delivery partners available on the platform."
},

{
title:"📅 Scheduled Pickups",
value:stats.scheduled,
color:"#eab308",
description:"Pickup schedules created."
},

{
title:"✅ Completed Deliveries",
value:stats.delivered,
color:"#22c55e",
description:"Successfully completed deliveries."

}

];

    return (

        <>

            <AdminSidebar />

            <div className="admin-page">

                <TopNavbar />

                <div className="admin-banner">

<div>

<h1 className="admin-title">

👨‍💼 {t("Administrator Control Center")}

</h1>

<p className="admin-subtitle">

{t("Monitor platform users, businesses, NGOs, inventory, donations and deliveries from one place.")}

</p>

</div>

<div className="admin-badge">

⚡ System Online

</div>

</div>

<h3 className="admin-section-title">

📊 {t("Platform Overview")}

</h3>

<div className="row">

{

dashboardCards.map((card,index)=>(

<div
key={index}
className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4"
>

<DashboardCard

title={card.title}

value={formatLocalizedNumber(card.value || 0, language)}

color={card.color}

onClick={()=>setSelectedCard(card)}

/>

</div>

))

}

</div>

{

selectedCard && (

<div
className="modal fade show"
style={{

display:"block",

background:"rgba(0,0,0,.5)"

}}
>

<div className="modal-dialog modal-dialog-centered">

<div
className="modal-content"
style={{

borderRadius:"20px"

}}
>

<div className="modal-header">

<h4>

{selectedCard.title}

</h4>

<button

className="btn-close"

onClick={()=>setSelectedCard(null)}

>

</button>

</div>

<div className="modal-body text-center">

<h1
style={{

color:selectedCard.color,

fontSize:"56px"

}}
>

{formatLocalizedNumber(selectedCard.value || 0, language)}

</h1>

<p className="text-muted">

{selectedCard.description}

</p>

</div>

<div className="modal-footer">

<button

className="btn btn-primary"

onClick={()=>setSelectedCard(null)}

>

Close

</button>

</div>

</div>

</div>

</div>

)

}

            </div>

        </>

    );

}

export default AdminDashboard;