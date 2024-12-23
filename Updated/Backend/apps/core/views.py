from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status,viewsets
from .models import CategoryType, DailyExpensePharmacy, Patient, Staff, Stock
from .serializers import CategoryTypeSerializer, DailyExpensePharmacySerializer, PatientSerializer, StaffSerializer, StockSerializer

class PatientListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            patients = Patient.objects.all()
            serializer = PatientSerializer(patients, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error fetching patients: {e}")
            return Response({"error": "Failed to load patients."}, status=500)
    
    def post(self, request):
        try:
            # Serialize and validate the incoming data
            serializer = PatientSerializer(data=request.data)
            if serializer.is_valid():
                # Save the new patient to the database
                serializer.save()
                return Response({"message": "Patient registered successfully."}, status=201)
            else:
                return Response(serializer.errors, status=400)
        except Exception as e:
            print(f"Error registering patient: {e}")
            return Response({"error": "Failed to register patient."}, status=500)
        
class PatientDeleteView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        """
        Handle GET request to retrieve patient details by ID.
        """
        try:
            patient = Patient.objects.get(pk=pk)
            patient_data = {
                "id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "patient_type": patient.patient_type,
                "category": patient.category.id if patient.category else None,  # Include the category ID if it exists
                "created_at": patient.created_at
            }
            return Response(patient_data, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
            patient.delete()
            return Response({"message": "Patient deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

import logging

logger = logging.getLogger(__name__)

class PatientUpdateView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
            serializer = PatientSerializer(patient, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
class StockListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        stocks = Stock.objects.all()
        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)

    def post(self, request):
        print("Request payload:", request.data)  # Log the incoming data
        serializer = StockSerializer(data=request.data)
        if serializer.is_valid():
            print("Validated data:", serializer.validated_data)  # Log validated data
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)  # Log validation errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def put(self, request, pk):
        try:
            stock = Stock.objects.get(pk=pk)
        except Stock.DoesNotExist:
            return Response({"error": "Stock not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StockSerializer(stock, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            stock = Stock.objects.get(pk=pk)
            stock.delete()
            return Response({"message": "Stock deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Stock.DoesNotExist:
            return Response({"error": "Stock not found."}, status=status.HTTP_404_NOT_FOUND)
        

class StockCreateView(APIView):
    def post(self, request):
        print("Request payload:", request.data)  # Log incoming request data
        serializer = StockSerializer(data=request.data)
        
        if serializer.is_valid():
            print("Validated data:", serializer.validated_data)  # Log validated data
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)  # Log validation errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
from rest_framework import generics
class CategoryTypeListCreateView(generics.ListCreateAPIView):
    
    permission_classes = [AllowAny]
    queryset = CategoryType.objects.all()
    serializer_class = CategoryTypeSerializer

class CategoryTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    
    permission_classes = [AllowAny]
    queryset = CategoryType.objects.all()
    serializer_class = CategoryTypeSerializer
    


from .models import Pharmaceutical
from .serializers import PharmaceuticalSerializer

class PharmaceuticalListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Pharmaceutical.objects.all()
    serializer_class = PharmaceuticalSerializer

class PharmaceuticalDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Pharmaceutical.objects.all()
    serializer_class = PharmaceuticalSerializer

    
    

from .serializers import DailyExpenseSerializer, TakenPriceSerializer
from . models import DailyExpense, TakenPrice
class DailyExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    queryset = DailyExpense.objects.all()
    serializer_class = DailyExpenseSerializer
    
class TakenDailyExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = TakenPrice.objects.all()
    serializer_class = TakenPriceSerializer

class StaffViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer


class DailyExpensePharmacyViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = DailyExpensePharmacy.objects.all()
    serializer_class = DailyExpensePharmacySerializer