from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'role',
            'skills',
            'location',
            'bio',
            'organization_name',
            'organization_description',
            'website_url',
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            role=validated_data.get('role'),
            skills=validated_data.get('skills'),
            location=validated_data.get('location'),
            bio=validated_data.get('bio'),
            organization_name=validated_data.get('organization_name'),
            organization_description=validated_data.get('organization_description'),
            website_url=validated_data.get('website_url'),
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'role',
            'skills',
            'location',
            'bio',
            'organization_name',
            'organization_description',
            'website_url',
        ]
        read_only_fields = ['username', 'email', 'role']
