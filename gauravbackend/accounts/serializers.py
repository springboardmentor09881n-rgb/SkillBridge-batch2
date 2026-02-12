from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'full_name',
            'role',
            'location',
            'organization_name',
            'organization_description',
            'website_url',
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            full_name=validated_data.get('full_name'),
            role=validated_data.get('role'),
            location=validated_data.get('location'),
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
            'full_name',
            'role',
            'location',
            'organization_name',
            'organization_description',
            'website_url',
        ]
        read_only_fields = ['username', 'email', 'role']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid username or password.")
            if not user.is_active:
                raise serializers.ValidationError("User is inactive.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")

        data['user'] = user
        return data
