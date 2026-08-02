import os
from sarvamai import SarvamAI

client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)


def translate_text(text, target_language):
    response = client.text.translate(
        input=text,
        source_language_code="en-IN",
        target_language_code=target_language,
        model="sarvam-translate:v1"
    )

    return response.translated_text