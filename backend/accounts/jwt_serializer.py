from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role
        token["username"] = user.username
        token["owner_name"] = (
    user.owner_name
    if user.owner_name
    else user.username
)
        token["business_name"] = user.business_name
        token["business_type"] = user.business_type

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["role"] = self.user.role
        data["username"] = self.user.username
        data["owner_name"] = (
    self.user.owner_name
    if self.user.owner_name
    else self.user.username
)
        data["business_name"] = self.user.business_name
        data["business_type"] = self.user.business_type

        return data