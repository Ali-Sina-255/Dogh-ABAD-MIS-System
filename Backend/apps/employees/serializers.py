from rest_framework import serializers

from .models import Employee, TeacherLevel, TeacherSalaryRule


class TeacherSalaryRuleSerializer(serializers.ModelSerializer):
    teacher_level = serializers.PrimaryKeyRelatedField(
        queryset=TeacherLevel.objects.all()
    )

    class Meta:
        model = TeacherSalaryRule
        fields = [
            "id",
            "teacher_level",
            "min_students",
            "max_students",
            "salary_amount",
        ]

    def validate(self, data):
        level = data["teacher_level"]
        min_s = data["min_students"]
        max_s = data["max_students"]

        if min_s >= max_s:
            raise serializers.ValidationError(
                "min_students must be less than max_students"
            )

        # Exclude current instance if updating
        qs = TeacherSalaryRule.objects.filter(
            teacher_level=level,
            min_students__lt=max_s,
            max_students__gt=min_s,
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "Overlapping salary range for this teacher level"
            )

        return data


class TeacherLevelSerializer(serializers.ModelSerializer):
    salary_rules = TeacherSalaryRuleSerializer(many=True, read_only=True)

    class Meta:
        model = TeacherLevel
        fields = [
            "id",
            "name",
            "description",
            "salary_rules",
        ]


class EmployeeSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    contract_type_display = serializers.CharField(
        source="get_contract_type_display", read_only=True
    )
    actual_salary = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "role_display",
            "contract_type",
            "contract_type_display",
            "is_fixed_salary",
            "teacher_level",
            "salary",
            "identity_card",
            "contract_duration",
            "actual_salary",
            "started_date",
            "created_at",
            "jalali_month",
        ]

    def get_actual_salary(self, obj):
        """Calculate salary dynamically based on active student count"""
        request = self.context.get("request")
        student_count = 0
        if request:
            student_count = int(request.query_params.get("student_count", 0))
        return obj.calculate_salary(student_count)

    def validate(self, attrs):
        role = attrs.get("role", getattr(self.instance, "role", None))
        contract_type = attrs.get(
            "contract_type", getattr(self.instance, "contract_type", None)
        )

        if role != Employee.Role.Doctor and contract_type != Employee.ContractType.FIX:
            raise serializers.ValidationError(
                {"contract_type": "Only staff can have percentage contracts."}
            )
        return attrs

    def create(self, validated_data):
        if validated_data.get("contract_type") == Employee.ContractType.PERCENTAGE:
            validated_data["salary"] = 0
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("contract_type") == Employee.ContractType.PERCENTAGE:
            validated_data["salary"] = 0
        return super().update(instance, validated_data)
