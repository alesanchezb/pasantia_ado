from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from ..services import ProfileService, EvidenceService
from .serializers import ProfileSerializer, EvidenceSerializer


class ProfileMeView(APIView):
    """
    Handles retrieving and updating the profile for the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = ProfileService.get_or_create_profile(request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = ProfileService.get_or_create_profile(request.user)
        serializer = ProfileSerializer(instance=profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class EvidenceView(APIView):
    """
    Handles listing and creating evidences for the logged-in user.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # For file uploads

    def get(self, request):
        profile = ProfileService.get_or_create_profile(request.user)
        evidences = EvidenceService.get_evidences_for_profile(profile)
        serializer = EvidenceSerializer(evidences, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        profile = ProfileService.get_or_create_profile(request.user)

        # The serializer validates 'name', 'kind', and 'file'
        # We pass the request context to build the absolute file URL on response
        serializer = EvidenceSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        # We use the service to perform the creation
        # The serializer's 'validated_data' contains the required fields
        new_evidence = EvidenceService.create_evidence(
            profile=profile, **serializer.validated_data
        )

        # We serialize the created object to return it, including the new file_url
        result_serializer = EvidenceSerializer(new_evidence, context={'request': request})
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


class EvidenceDetailView(APIView):
    """
    Handles deleting a specific evidence.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, evidence_id: int):
        profile = ProfileService.get_or_create_profile(request.user)

        was_deleted = EvidenceService.delete_evidence(
            profile=profile, evidence_id=evidence_id
        )

        if was_deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)


class DevelopmentLoginView(APIView):
    """
    Development-only endpoint to quickly log in or create a user.
    Accepts a POST request with "username" and "role" ('applicant' or 'evaluator').
    Returns JWT access and refresh tokens.
    """
    permission_classes = []  # No permissions needed to log in

    def post(self, request):
        username = request.data.get("username")
        role = request.data.get("role")

        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)

        if role not in ['applicant', 'evaluator']:
            return Response({"detail": "Role must be 'applicant' or 'evaluator'."}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create the user
        user, _ = User.objects.get_or_create(username=username)

        # Get or create the profile and set the role
        profile = ProfileService.get_or_create_profile(user)
        if profile.role != role:
            profile.role = role
            profile.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'role': profile.role,
            }
        })