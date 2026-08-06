from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from predictions.api.serializers import PredictionCreateSerializer, PredictionSerializer
from predictions.models import Prediction
from predictions.services.prediction_service import PredictionService


class PredictView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        serializer = PredictionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prediction = PredictionService().predict(serializer.validated_data["image"])

        return Response(
            PredictionSerializer(prediction, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PredictionHistoryView(ListAPIView):
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
