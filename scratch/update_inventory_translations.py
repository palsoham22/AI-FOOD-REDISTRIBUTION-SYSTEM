import json
import re

new_translations = {
    "Monitor and manage all inventory items across the FoodBridge AI platform.": {
        "en": "Monitor and manage all inventory items across the FoodBridge AI platform.",
        "hi": "FoodBridge AI प्लेटफ़ॉर्म पर सभी इन्वेंट्री आइटमों की निगरानी और प्रबंधन करें।",
        "ta": "FoodBridge AI தளத்தில் உள்ள அனைத்து சரக்கு பொருட்களையும் கண்காணித்து நிர்வகிக்கவும்.",
        "te": "FoodBridge AI ప్లాట్‌ఫారమ్‌లో అన్ని ఇన్వెంటరీ అంశాలను పర్యవేక్షించండి మరియు నిర్వహించండి.",
        "ml": "FoodBridge AI പ്ലാറ്റ്‌ഫോമിലുടനീളമുള്ള എല്ലാ ഇൻവെന്ററി ഇനങ്ങളും നിരീക്ഷിച്ച് നിയന്ത്രിക്കുക.",
        "bn": "FoodBridge AI প্ল্যাটফর্ম জুড়ে সমস্ত ইনভেন্টরি আইটেম নিরীক্ষণ এবং পরিচালনা করুন।"
    },
    "Search products, donors, categories...": {
        "en": "Search products, donors, categories...",
        "hi": "उत्पाद, दाता, श्रेणियां खोजें...",
        "ta": "தயாரிப்புகள், நன்கொடையாளர்கள், வகைகளைத் தேடுங்கள்...",
        "te": "ఉత్పత్తులు, దాతలు, వర్గాలను శోధించండి...",
        "ml": "ഉൽപ്പന്നങ്ങൾ, ദാതാക്കൾ, വിഭാഗങ്ങൾ തിരയുക...",
        "bn": "পণ্য, দাতা, বিভাগ খুঁজুন..."
    },
    "Sort By": {
        "en": "Sort By",
        "hi": "इसके अनुसार क्रमबद्ध करें",
        "ta": "வரிசைப்படுத்துக",
        "te": "దీని ప్రకారం క్రమబద్ధీకరించు",
        "ml": "ഇതിൻപ്രകാരം അടുക്കുക",
        "bn": "দ্বারা বাছাই করুন"
    },
    "Ascending": {
        "en": "Ascending",
        "hi": "आरोही",
        "ta": "ஏறுவரிசை",
        "te": "ఆరోహణ",
        "ml": "ആരോഹണ ക്രമം",
        "bn": "উর্ধ্বমুখী"
    },
    "Descending": {
        "en": "Descending",
        "hi": "अवरोही",
        "ta": "இறங்குவரிசை",
        "te": "అవరోహణ",
        "ml": "അവരോഹണ ക്രമം",
        "bn": "নিম্নমুখী"
    },
    "Items per page": {
        "en": "Items per page",
        "hi": "प्रति पृष्ठ आइटम",
        "ta": "பக்கத்திற்கு உருப்படிகள்",
        "te": "పేజీకి అంశాలు",
        "ml": "ഒരു പേജിലെ ഇനങ്ങൾ",
        "bn": "প্রতি পৃষ্ঠায় আইটেম"
    },
    "Showing": {
        "en": "Showing",
        "hi": "दिखाया जा रहा है",
        "ta": "காட்டப்படுகிறது",
        "te": "చూపిస్తోంది",
        "ml": "കാണിക്കുന്നു",
        "bn": "দেখানো হচ্ছে"
    },
    "to": {
        "en": "to",
        "hi": "से",
        "ta": "முதல்",
        "te": "నుండి",
        "ml": "വരെ",
        "bn": "থেকে"
    },
    "of": {
        "en": "of",
        "hi": "का",
        "ta": "இல்",
        "te": "లో",
        "ml": "ൽ",
        "bn": "এর"
    },
    "items": {
        "en": "items",
        "hi": "आइटम",
        "ta": "பொருட்கள்",
        "te": "అంశాలు",
        "ml": "ഇനങ്ങൾ",
        "bn": "আইটেম"
    },
    "Previous": {
        "en": "Previous",
        "hi": "पिछला",
        "ta": "முந்தைய",
        "te": "మునుపటి",
        "ml": "മുമ്പത്തേത്",
        "bn": "পূর্ববর্তী"
    },
    "Next": {
        "en": "Next",
        "hi": "अगला",
        "ta": "அடுத்தது",
        "te": "తదుపరి",
        "ml": "അടുത്തത്",
        "bn": "পরবর্তী"
    },
    "Page": {
        "en": "Page",
        "hi": "पृष्ठ",
        "ta": "பக்கம்",
        "te": "పేజీ",
        "ml": "പേജ്",
        "bn": "পৃষ্ঠা"
    },
    "No inventory records available.": {
        "en": "No inventory records available.",
        "hi": "कोई इन्वेंट्री रिकॉर्ड उपलब्ध नहीं है।",
        "ta": "சரக்கு பதிவுகள் எதுவும் கிடைக்கவில்லை.",
        "te": "ఇన్వెంటరీ రికార్డులు అందుబాటులో లేవు.",
        "ml": "ഇൻവെന്ററി രേഖകളൊന്നും ലഭ്യമല്ല.",
        "bn": "কোন ইনভেন্টরি রেকর্ড উপলব্ধ নেই।"
    },
    "No inventory records match your filters.": {
        "en": "No inventory records match your filters.",
        "hi": "कोई भी इन्वेंट्री रिकॉर्ड आपके फ़िल्टर से मेल नहीं खाता।",
        "ta": "உங்கள் வடிப்பான்களுடன் எந்த சரக்கு பதிவும் பொருந்தவில்லை.",
        "te": "మీ ఫిల్టర్‌లతో సరిపోలే ఇన్వెంటరీ రికార్డులు లేవు.",
        "ml": "നിങ്ങളുടെ ഫിൽട്ടറുകളുമായി പൊരുത്തപ്പെടുന്ന ഇൻവെന്ററി രേഖകളൊന്നുമില്ല.",
        "bn": "কোনো ইনভেন্টরি রেকর্ড আপনার ফিল্টারের সাথে মেলে না।"
    },
    "Unable to load inventory data.": {
        "en": "Unable to load inventory data.",
        "hi": "इन्वेंट्री डेटा लोड करने में असमर्थ।",
        "ta": "சரக்கு தரவை ஏற்ற முடியவில்லை.",
        "te": "ఇన్వెంటరీ డేటాను లోడ్ చేయడం సాధ్యపడలేదు.",
        "ml": "ഇൻവെന്ററി ഡാറ്റ ലോഡുചെയ്യാനാകുന്നില്ല.",
        "bn": "ইনভেন্টরি ডেটা লোড করা যাচ্ছে না।"
    },
    "Product Details": {
        "en": "Product Details",
        "hi": "उत्पाद विवरण",
        "ta": "தயாரிப்பு விவரங்கள்",
        "te": "ఉత్పత్తి వివరాలు",
        "ml": "ഉൽപ്പന്ന വിശദാംശങ്ങൾ",
        "bn": "পণ্যের বিবরণ"
    },
    "Created Date": {
        "en": "Created Date",
        "hi": "बनाने की तिथि",
        "ta": "உருவாக்கப்பட்ட தேதி",
        "te": "సృష్టించిన తేదీ",
        "ml": "സൃഷ്ടിച്ച തീയതി",
        "bn": "তৈরির তারিখ"
    },
    "Clear All": {
        "en": "Clear All",
        "hi": "सभी साफ़ करें",
        "ta": "அனைத்தையும் அழிக்கவும்",
        "te": "అన్నీ క్లియర్ చేయండి",
        "ml": "എല്ലാം മായ്‌ക്കുക",
        "bn": "সব মুছুন"
    },
    "Available Products": {
        "en": "Available Products",
        "hi": "उपलब्ध उत्पाद",
        "ta": "கிடைக்கும் தயாரிப்புகள்",
        "te": "అందుబాటులో ఉన్న ఉత్పత్తులు",
        "ml": "ലഭ്യമായ ഉൽപ്പന്നങ്ങൾ",
        "bn": "উপলব্ধ পণ্য"
    },
    "Categories": {
        "en": "Categories",
        "hi": "श्रेणियाँ",
        "ta": "வகைகள்",
        "te": "వర్గాలు",
        "ml": "വിഭാഗങ്ങൾ",
        "bn": "বিভাগসমূহ"
    },
    "Items": {
        "en": "Items",
        "hi": "आइटम",
        "ta": "பொருட்கள்",
        "te": "అంశాలు",
        "ml": "ഇനങ്ങൾ",
        "bn": "আইটেম"
    }
}

locales = ["en", "hi", "ta", "te", "ml", "bn"]
for loc in locales:
    path = f"frontend/src/i18n/locales/{loc}/translation.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    added = 0
    for key, trans in new_translations.items():
        if key not in data:
            data[key] = trans[loc]
            added += 1
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"{loc}: added {added} keys, total: {len(data)}")

# Update index.js LABELS.ADMIN_INVENTORY
with open("frontend/src/translations/index.js", "r", encoding="utf-8") as f:
    idx_content = f.read()

pattern = r"ADMIN_INVENTORY:\s*\[[^\]]*\],"
replacement = """ADMIN_INVENTORY: [
    "Inventory Management",
    "Monitor and manage all inventory items across the FoodBridge AI platform.",
    "Total Products",
    "Available / Donated",
    "Accepted",
    "Scheduled",
    "Out For Pickup",
    "Delivered",
    "Completed",
    "Expired",
    "Available Products",
    "Categories",
    "Items",
    "Search products, donors, categories...",
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
    "items",
    "Previous",
    "Next",
    "Page",
    "No inventory records available.",
    "No inventory records match your filters.",
    "Unable to load inventory data.",
    "Retry",
    "Product Details",
    "Close",
    "Donor / Business",
    "Storage Type",
    "Pickup Address",
    "Contact Number",
    "Description",
    "Created Date",
    "View Details",
    "Room Temperature",
    "Refrigerated",
    "Frozen",
    "Dairy",
    "Fruits",
    "Vegetables",
    "Bakery",
    "Beverages",
    "Others",
    "Kg",
    "Litre",
    "Packet",
    "Piece",
    "Product",
    "Category",
    "Quantity",
    "Status",
    "Expiry",
    "ID",
    "Actions",
    "Individual Donor"
],"""

new_idx, cnt = re.subn(pattern, replacement, idx_content)
print(f"Replaced in index.js: {cnt}")
if cnt > 0:
    with open("frontend/src/translations/index.js", "w", encoding="utf-8") as f:
        f.write(new_idx)
    print("Updated index.js successfully")

