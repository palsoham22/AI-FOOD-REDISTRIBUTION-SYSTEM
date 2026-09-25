import React from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import "../styles/BusinessLayout.css";

function BusinessLayout({ children }) {
    return (
        <div className="fb-business-app">
            <Sidebar />
            <div className="fb-business-main">
                <TopNavbar />
                <div className="fb-business-content">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default BusinessLayout;
