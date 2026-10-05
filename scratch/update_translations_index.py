import os

filepath = 'frontend/src/translations/index.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = 'ADMIN_TRANSACTIONS: ['
end_marker = 'ADMIN_ANALYTICS: ['

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Markers not found!')
    exit(1)

new_admin_transactions = '''ADMIN_TRANSACTIONS: [
    "Transactions",
    "Operational Ledger",
    "Donation & Activity Ledger",
    "Complete operational ledger of all food redistribution and inventory lifecycle events.",
    "Operational Notice: FoodBridge tracks food redistribution lifecycle events. No financial payments or fees are processed on this platform.",
    "Total Ledger Records",
    "Delivered & Completed",
    "Accepted & Scheduled",
    "Available / Listed",
    "Search ledger by product, donor, address, ID...",
    "All Statuses",
    "All Categories",
    "Reset Filters",
    "Clear Filters",
    "Clear All",
    "Sort By",
    "Ascending",
    "Descending",
    "Items per page",
    "Showing",
    "to",
    "of",
    "records",
    "items",
    "Previous",
    "Next",
    "Page",
    "No ledger records available.",
    "Operational records will appear here as food is listed, accepted, and redistributed.",
    "No ledger records match your filters.",
    "Try adjusting your search terms or reset applied filters.",
    "Unable to load ledger records.",
    "Retry",
    "Ledger Record Details",
    "Record Information",
    "Logistics & Lifecycle",
    "Close",
    "Donor / Business",
    "Donor Type",
    "Storage Type",
    "Pickup Address",
    "Contact Number",
    "Description",
    "Created Date",
    "Expiry Date",
    "View Details",
    "Product",
    "Category",
    "Quantity",
    "Status",
    "Lifecycle Status",
    "Record ID",
    "ID",
    "Actions",
    "Individual Donor",
    "Business",
    "Individual",
    "Refresh",
    "Refreshing...",
    "Assigned Driver",
    "Vehicle Number",
    "Pickup Schedule",
    "Verification Status",
    "Pickup Verified",
    "Delivery Verified",
    "Pending Verification",
    "Not Specified",
    "Available",
    "Donated",
    "Accepted",
    "Scheduled",
    "Out For Pickup",
    "Delivered",
    "Completed",
    "Expired",
    "Dairy",
    "Fruits",
    "Vegetables",
    "Bakery",
    "Beverages",
    "Others",
    "Room Temperature",
    "Refrigerated",
    "Frozen",
    "Operational Note: This record represents a physical food redistribution lifecycle event on FoodBridge."
],
'''

new_content = content[:start_idx] + new_admin_transactions + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
    f.flush()
    os.fsync(f.fileno())

print('Successfully updated ADMIN_TRANSACTIONS in translations/index.js')

