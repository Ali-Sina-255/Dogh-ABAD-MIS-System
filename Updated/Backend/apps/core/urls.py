from django.urls import path , include
from .views import CategoryTypeDetailView, CategoryTypeListCreateView, DailyExpensePharmacyViewSet, PatientListView, PatientDeleteView, PatientUpdateView, PharmaceuticalDetailView, PharmaceuticalListCreateView, StaffViewSet, StockListView

from rest_framework.routers import DefaultRouter
from .views import DailyExpenseViewSet, TakenDailyExpenseViewSet, TakenDailyExpenseViewSet

router = DefaultRouter()
router.register('daily-expenses', DailyExpenseViewSet)
router.register('taken-expenses', TakenDailyExpenseViewSet)
router.register('daily-expenses-pharmacy', DailyExpensePharmacyViewSet)
router.register('staff', StaffViewSet, basename='staff')
urlpatterns = [
    path('', include(router.urls)),
    path('patients/', PatientListView.as_view(), name='patient-list'),
    path('patients/<int:pk>/', PatientDeleteView.as_view(), name='patient-delete'),
    path('patients/<int:pk>/update/', PatientUpdateView.as_view(), name='patient-update'),
    path('stocks/', StockListView.as_view(), name='stock-list'),
    path('stocks/<int:pk>/', StockListView.as_view(), name='stock-detail'),  
    
    path('category-types/', CategoryTypeListCreateView.as_view(), name='category-type-list-create'),
    path('category-types/<int:pk>/', CategoryTypeDetailView.as_view(), name='category-type-detail'),
    
    path('pharmaceuticals/', PharmaceuticalListCreateView.as_view(), name='pharmaceutical-list-create'),
    path('pharmaceuticals/<int:pk>/', PharmaceuticalDetailView.as_view(), name='pharmaceutical-detail'),
    

]