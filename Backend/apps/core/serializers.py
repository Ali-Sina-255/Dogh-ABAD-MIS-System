from apps.employees.models import Employee
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    CategoryType,
    LabTest,
    Patient,
    Pharmaceutical,
    PharmaceuticalDrug,
    Stock,
    TestType,
)

User = get_user_model()


class TestTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestType
        fields = ["id", "name", "date", "jalali_month"]


class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = [
            "id",
            "patient",
            "test_type",
            "price",
            "refer_to",
            "date",
            "jalali_month",
        ]


# ---------------- Stock ---------------- #
class StockSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()  # read-only, calculated automatically

    class Meta:
        model = Stock
        fields = [
            "id",
            "name",
            "price",
            "percentage",
            "total_price",
            "amount",
            "created_at",
            "updated_at",
            "jalali_month",
        ]

    def calculate_total_price(self, price, percentage):
        """Helper function to calculate total price."""
        if price is not None and percentage is not None:
            return price * (1 + (percentage / 100))
        return 0

    def create(self, validated_data):
        validated_data["total_price"] = self.calculate_total_price(
            validated_data.get("price"), validated_data.get("percentage")
        )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        price = validated_data.get("price", instance.price)
        percentage = validated_data.get("percentage", instance.percentage)
        instance.total_price = self.calculate_total_price(price, percentage)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ---------------- CategoryType ---------------- #
class CategoryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryType
        fields = ["id", "name", "created_at"]


# ---------------- Patient ---------------- #
class PatientSerializer(serializers.ModelSerializer):
    all_categories = CategoryTypeSerializer(many=True, read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=CategoryType.objects.all(), required=False
    )

    class Meta:
        model = Patient
        fields = [
            "id",
            "name",
            "age",
            "patient_type",
            "category",
            "all_categories",
            "created_at",
            "jalali_month",
        ]


# ---------------- Pharmaceutical & Drugs ---------------- #
class PharmaceuticalDrugSerializer(serializers.ModelSerializer):
    drug = StockSerializer(read_only=True)  # nested drug info for reads
    drug_id = serializers.PrimaryKeyRelatedField(
        queryset=Stock.objects.all(), source="drug", write_only=True
    )

    class Meta:
        model = PharmaceuticalDrug
        fields = ["drug", "drug_id", "amount_used"]


class PharmaceuticalSerializer(serializers.ModelSerializer):
    doctor_name = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), required=False
    )
    patient_name = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    drugs = PharmaceuticalDrugSerializer(many=True, source="pharmaceuticaldrug_set")
    jalali_month = serializers.CharField(read_only=True)

    class Meta:
        model = Pharmaceutical
        fields = [
            "id",
            "doctor_name",
            "patient_name",
            "drugs",
            "copy",
            "price",
            "created_at",
            "updated_at",
            "jalali_month",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        drugs_data = validated_data.pop("pharmaceuticaldrug_set", [])
        pharmaceutical = Pharmaceutical.objects.create(**validated_data)

        for item in drugs_data:
            drug_instance = item["drug"]
            amount_used = item["amount_used"]

            # Decrease stock
            if drug_instance.amount < amount_used:
                raise serializers.ValidationError(
                    {
                        f"drug_{drug_instance.id}": f"Not enough stock for '{drug_instance.name}'."
                    }
                )
            drug_instance.amount -= amount_used
            drug_instance.save()

            # Create through model
            PharmaceuticalDrug.objects.create(
                pharmaceutical=pharmaceutical,
                drug=drug_instance,
                amount_used=amount_used,
            )

        return pharmaceutical

    def update(self, instance, validated_data):
        drugs_data = validated_data.pop("pharmaceuticaldrug_set", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if drugs_data is not None:
            # Restore previous stock before clearing old relations
            for old_relation in instance.pharmaceuticaldrug_set.all():
                old_relation.drug.amount += old_relation.amount_used
                old_relation.drug.save()
            instance.pharmaceuticaldrug_set.all().delete()

            # Deduct stock for new relations
            for item in drugs_data:
                drug_instance = item["drug"]
                amount_used = item["amount_used"]

                if drug_instance.amount < amount_used:
                    raise serializers.ValidationError(
                        {
                            f"drug_{drug_instance.id}": f"Not enough stock for '{drug_instance.name}'."
                        }
                    )
                drug_instance.amount -= amount_used
                drug_instance.save()

                PharmaceuticalDrug.objects.create(
                    pharmaceutical=instance,
                    drug=drug_instance,
                    amount_used=amount_used,
                )

        return instance
