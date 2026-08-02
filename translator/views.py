from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import translate_text


@api_view(["POST"])
def translate(request):
    texts = request.data.get("texts", [])
    target = request.data.get("target", "hi-IN")

    if not texts:
        return Response(
            {"error": "texts list is required"},
            status=400
        )

    translations = {}

    for text in texts:
        translations[text] = translate_text(text, target)

    return Response({
        "translations": translations
    })