from rest_framework import serializers
from .models import CategoryType, Patient, Staff, Stock, Pharmaceutical, DailyExpensePharmacy


class StockSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()  # Read-only field that will be calculated

    class Meta:
        model = Stock
        fields = ['id', 'name', 'price', 'percentage', 'total_price', 'amount', 'daily_used', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically calculate `total_price` when creating a new instance
        price = validated_data.get('price')
        percentage = validated_data.get('percentage')

        if price is not None and percentage is not None:
            validated_data['total_price'] = price * (1 + (percentage / 100))
        else:
            # Set a default value if price or percentage is missing (optional)
            validated_data['total_price'] = 0

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Calculate `total_price` when updating an existing instance
        price = validated_data.get('price', instance.price)
        percentage = validated_data.get('percentage', instance.percentage)

        if price is not None and percentage is not None:
            instance.total_price = price * (1 + (percentage / 100))
        else:
            instance.total_price = 0  # Optional: set to zero or another default value

        return super().update(instance, validated_data)


class CategoryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryType
        fields = ['id', 'name', 'created_at']
        

class PatientSerializer(serializers.ModelSerializer):
    all_categories = CategoryTypeSerializer(many=True, read_only=True)

    # Include the selected category ID
    category = serializers.PrimaryKeyRelatedField(queryset=CategoryType.objects.all(), required=False)

    class Meta:
        model = Patient
        fields = ['id', 'name', 'age', 'patient_type', 'category', 'all_categories']


from django.contrib.auth import get_user_model 

# Assuming you have a custom User model:
User = get_user_model()

class PharmaceuticalSerializer(serializers.ModelSerializer):
    doctor_name = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    patient_name = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    
    class Meta:
        model = Pharmaceutical
        fields = ['id', 'doctor_name', 'patient_name', 'copy', 'price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
from .models import DailyExpense
class DailyExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyExpense
        fields = ['id', 'name', 'salary', 'who', 'totla_price', 'date']
        
from .models import TakenPrice
class TakenPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TakenPrice
        fields = ['id', 'name', 'description', 'amount', 'date']

class StaffSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(default='noemail@domain.com')
    last_name = serializers.CharField(default='Unknown')
    position = serializers.PrimaryKeyRelatedField(queryset=CategoryType.objects.all())  
    position_name = serializers.CharField(source='position.name', read_only=True)
    class Meta:
        model = Staff
        fields = [
            'id', 'first_name', 'last_name', 'email', 'role', 'phone_number',
            'position','position_name', 'salary', 'stared_date', 'created_at',
        ]


class DailyExpensePharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyExpensePharmacy
        fields = ['id', 'name', 'amount', 'date']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value