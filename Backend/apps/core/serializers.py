from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    CategoryType,
    DailyExpense,
    DailyExpensePharmacy,
    Patient,
    Pharmaceutical,
    PharmaceuticalDrug,
    Staff,
    Stock,
    TakenPrice,
)

User = get_user_model()


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
        fields = ["id", "name", "age", "patient_type", "category", "all_categories"]


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
        queryset=User.objects.all(), required=False
    )
    patient_name = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    drugs = PharmaceuticalDrugSerializer(many=True, source="pharmaceuticaldrug_set")

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


# ---------------- DailyExpense ---------------- #
class DailyExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyExpense
        fields = ["id", "name", "salary", "who", "totla_price", "date"]


# ---------------- TakenPrice ---------------- #
class TakenPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TakenPrice
        fields = ["id", "name", "description", "amount", "date"]


# ---------------- Staff ---------------- #
class StaffSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(default="noemail@domain.com")
    last_name = serializers.CharField(default="Unknown")
    position = serializers.PrimaryKeyRelatedField(
        queryset=CategoryType.objects.all(), required=True
    )
    position_name = serializers.CharField(source="position.name", read_only=True)

    class Meta:
        model = Staff
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "phone_number",
            "position",
            "position_name",
            "salary",
            "stared_date",
            "created_at",
        ]


# ---------------- DailyExpensePharmacy ---------------- #
class DailyExpensePharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyExpensePharmacy
        fields = ["id", "name", "amount", "date"]

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value
