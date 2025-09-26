from rest_framework import serializers

from .models import Bill, Participant


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ["phone_number", "expected_amount", "paid_amount", "status"]


class BillCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    organizer_phone = serializers.CharField(max_length=15)
    total_amount = serializers.IntegerField(min_value=1)
    participant_phones = serializers.ListField(
        child=serializers.CharField(max_length=15), allow_empty=False
    )


class BillDetailSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Bill
        fields = [
            "id",
            "name",
            "organizer_phone",
            "total_amount",
            "mode",
            "status",
            "share_token",
            "participants",
        ]


