import os

filepath = 'frontend/src/translations/index.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = 'ADMIN_ANALYTICS: ['
end_marker = 'ADMIN_SETTINGS: ['

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Markers not found!')
    exit(1)

new_admin_analytics = '''ADMIN_ANALYTICS: [
    "Analytics",
    "Analytics Dashboard",
    "Platform Performance & Analytics",
    "Real-time operational metrics, donation status distributions, and stakeholder insights.",
    "Operational Notice: Analytics are calculated directly from live database records. No simulated growth projections or payment metrics exist.",
    "Operational Food Metrics",
    "Total Products",
    "Delivered & Completed",
    "Active Allocations",
    "Available Surplus",
    "Community & Stakeholders",
    "Total Businesses",
    "Total NGOs",
    "Delivery Partners",
    "Individual Donors",
    "Pending Actions",
    "Status Distribution",
    "Food Category Breakdown",
    "Stakeholder Ecosystem",
    "Breakdown of food items across their operational redistribution lifecycle.",
    "Total volume of food items categorized by product classification.",
    "Active platform participants registered across operational roles.",
    "Items",
    "Count",
    "Percentage",
    "Historical Trend Notice",
    "Time-series trend tracking will become available as historical logs accumulate over time. The charts above reflect 100% live verified platform aggregates.",
    "Unable to load analytics data.",
    "Retry",
    "Refresh",
    "Refreshing...",
    "No analytics data available yet.",
    "No items recorded in this distribution.",
    "Platform metrics will update in real time as surplus items are donated and claimed.",
    "Available",
    "Donated",
    "Accepted",
    "Scheduled",
    "Out For Pickup",
    "Delivered",
    "Completed",
    "Expired",
    "Pending",
    "Dairy",
    "Fruits",
    "Vegetables",
    "Bakery",
    "Beverages",
    "Others",
    "Businesses",
    "NGOs",
    "Delivery"
],
'''

new_content = content[:start_idx] + new_admin_analytics + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)
    f.flush()
    os.fsync(f.fileno())

print('Successfully updated ADMIN_ANALYTICS in translations/index.js')

