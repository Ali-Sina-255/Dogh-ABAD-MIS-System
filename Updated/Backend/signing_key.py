from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(email="alisinasultani255@gmail.com")

# Get the user's UUID (id)
user_uid = user.id
print("the user_id is ", user_uid)
