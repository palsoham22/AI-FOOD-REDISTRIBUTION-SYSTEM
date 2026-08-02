import os
from pathlib import Path
from dotenv import load_dotenv
from sarvamai import SarvamAI

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)

response = client.text.translate(
    input="Dashboard",
    source_language_code="en-IN",
    target_language_code="hi-IN",
    model="sarvam-translate:v1"
)

print(type(response))
print(response)