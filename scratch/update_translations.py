import re

with open('frontend/src/translations/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'    ADMIN_DASHBOARD: \[[^\]]*\],'

new_block = '''    ADMIN_DASHBOARD: [
        "Administrator Control Center",
        "Monitor platform users, businesses, NGOs, inventory, donations and deliveries from one place.",
        "Platform Active",
        "System Online",
        "Refresh",
        "Refreshing...",
        "Last updated",
        "Platform Overview",
        "Stakeholder Distribution",
        "Operations Overview",
        "Total Users",
        "Total platform users registered across all roles.",
        "Businesses",
        "Total businesses registered on the platform.",
        "NGOs",
        "Total NGOs connected with FoodBridge AI.",
        "Delivery Partners",
        "Active delivery partners available on the platform.",
        "Individual Donors",
        "Registered individual donors contributing food.",
        "Total Products",
        "Products currently managed in inventory.",
        "Available / Donated",
        "Food items listed and awaiting acceptance.",
        "Accepted Donations",
        "Donations accepted by partner NGOs.",
        "Scheduled Pickups",
        "Pickup schedules created and awaiting collection.",
        "Completed Deliveries",
        "Successfully completed deliveries.",
        "Recent Platform Activity",
        "Live activity across food donations and fulfillment.",
        "View All Donations",
        "No recent activity recorded yet.",
        "Quick Actions",
        "Manage Inventory",
        "Review and manage all products.",
        "View Donations",
        "Inspect real-time donation pipelines.",
        "Audit Transactions",
        "Review platform transaction logs.",
        "Platform Analytics",
        "Gain insights into recovery trends.",
        "System Settings",
        "Configure platform preferences.",
        "Metric Details",
        "Close",
        "View Related Records",
        "Failed to load dashboard data.",
        "Retry",
        "Item",
        "Donor / Business",
        "Category",
        "Quantity",
        "Status",
        "Date",
        "Click to View"
    ],'''

new_content, count = re.subn(pattern, new_block, content)
print(f'Replaced: {count}')
if count > 0:
    with open('frontend/src/translations/index.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated index.js successfully')

