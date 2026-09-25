import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BusinessDashboard from "./pages/BusinessDashboard";
import NGODashboard from "./pages/NGODashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import BarcodeScanner from "./pages/BarcodeScanner";
import InventoryPage from "./pages/InventoryPage";
import DonationHistory from "./pages/DonationHistory";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import TransactionHistory from "./pages/TransactionHistory";
import AvailableDonations from "./pages/AvailableDonations";
import AcceptedDonations from "./pages/AcceptedDonations";
import PickupSchedule from "./pages/PickupSchedule";
import PickupScheduleList from "./pages/PickupScheduleList";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AssignedPickups from "./pages/AssignedPickups";
import Navigation from "./pages/Navigation";
import CompletedDeliveries from "./pages/CompletedDeliveries";
import DeliveryProfile from "./pages/DeliveryProfile";
import DeliverySettings from "./pages/DeliverySettings";
import NGOReports from "./pages/NGOReports";
import NGOProfile from "./pages/NGOProfile";
import Beneficiaries from "./pages/Beneficiaries";
import NGOSettings from "./pages/NGOSettings";
import BusinessDonations from "./pages/BusinessDonations";
import AdminInventory from "./pages/AdminInventory";
import AdminDonations from "./pages/AdminDonations";
import AdminTransactions from "./pages/AdminTransactions";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import IndividualDashboard from "./pages/IndividualDashboard";
import DonateFood from "./pages/DonateFood";
import MyDonations from "./pages/MyDonations";
import IndividualSettings from "./pages/IndividualSettings"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/business-dashboard"
          element={<BusinessDashboard />}
        />
        <Route path="/business/dashboard" element={<BusinessDashboard />}
        />

        <Route
          path="/ngo-dashboard"
          element={<NGODashboard />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/business/add-product" element={<AddProduct />} />

        <Route
          path="/edit-product/:id"
          element={<EditProduct />}
        />
        <Route path="/business/edit-product/:id" element={<EditProduct />}
        />

        <Route
          path="/barcode-scanner"
          element={<BarcodeScanner />}
        />
        <Route path="/business/barcode-scanner" element={<BarcodeScanner />}
        />

        <Route
          path="/inventory"
          element={<InventoryPage />}
        />
        <Route path="/business/inventory" element={<InventoryPage />}
        />

        <Route
          path="/ngo-history"
          element={<DonationHistory />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />
        <Route path="/business/analytics" element={<Analytics />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
        <Route path="/business/settings" element={<Settings />}
        />

        <Route
    path="/transactions"
    element={<TransactionHistory />}
        />
        <Route path="/business/transactions" element={<TransactionHistory />}
/>

<Route
    path="/available-donations"
    element={<AvailableDonations />}
/>
<Route
    path="/accepted-donations"
    element={<AcceptedDonations />}
/>

<Route
    path="/schedule-pickup/:id"
    element={<PickupSchedule />}
/>

<Route
    path="/pickup-schedule"
    element={<PickupScheduleList />}
/>

<Route
    path="/delivery-dashboard"
    element={<DeliveryDashboard />}
/>

<Route
    path="/assigned-pickups"
    element={<AssignedPickups />}
/>

<Route

    path="/delivery-map"

    element={<Navigation />}

/>

<Route
    path="/completed-deliveries"
    element={<CompletedDeliveries />}
/>

<Route
    path="/delivery-profile"
    element={<DeliveryProfile />}
/>

<Route
    path="/delivery-settings"
    element={<DeliverySettings />}
/>

<Route
    path="/ngo-reports"
    element={<NGOReports />}
/>

<Route
    path="/ngo-profile"
    element={<NGOProfile />}
/>

<Route
    path="/beneficiaries"
    element={<Beneficiaries />}
/>

<Route
    path="/ngo-settings"
    element={<NGOSettings />}
/>

<Route
    path="/business-donations"
    element={<BusinessDonations />}
        />
        <Route path="/business/donations" element={<BusinessDonations />}
/>

<Route
    path="/admin/inventory"
    element={<AdminInventory />}
/>

<Route path="/admin/donations" element={<AdminDonations />} />
<Route path="/admin/transactions" element={<AdminTransactions />} />
<Route path="/admin/analytics" element={<AdminAnalytics />} />
<Route path="/admin/settings" element={<AdminSettings />} />
<Route
    path="/individual"
    element={<IndividualDashboard />}
/>
<Route
    path="/donate-food"
    element={<DonateFood />}
/>
<Route
    path="/my-donations"
    element={<MyDonations />}
/>
<Route
    path="/individual-settings"
    element={<IndividualSettings />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;