from django.urls import path

from .views import POSProductsView, ImportPOSProductsView

urlpatterns = [

    path(

        "products/",

        POSProductsView.as_view()

    ),

    path(

        "import/",

        ImportPOSProductsView.as_view()

    ),

]