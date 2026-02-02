from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, first_name, last_name, email, password=None):
        if not email:
            raise ValueError("User must have an email address!")

        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, first_name, last_name, email, password=None):
        # Create a user and set necessary flags for superuser
        user = self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=self.normalize_email(email),
            password=password,
        )
        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.is_superadmin = True

        # Assign the Admin role (0) to the superuser
        user.role = User.Admin

        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    Admin = 0
    Designer = 1
    Reception = 2
    SuperDesigner = 3
    Printer = 4
    Delivered = 5
    Digital = 6
    Bill = 7
    Chaspak = 8
    Shop_role = 9
    Laser = 10
    ROLE_CHOICES = (
        (Designer, "Designer"),
        (Reception, "Reception"),
        (SuperDesigner, "SuperDesigner"),
        (Admin, "Admin"),
        (Printer, "Printer"),
        (Delivered, "Delivered"),
        (Digital, "Digital"),
        (Bill, "Bill"),
        (Chaspak, "Chaspak"),
        (Shop_role, "Shop role"),
        (Laser, "Laser"),
    )
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    role = models.PositiveSmallIntegerField(choices=ROLE_CHOICES, blank=True, null=True)
    phone_number = models.CharField(max_length=13, blank=True, null=True)
    is_free = models.BooleanField(default=False, blank=True, null=True)
    otp = models.CharField(max_length=8, blank=True, null=True)
    refresh_token = models.CharField(max_length=1000, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_superadmin = models.BooleanField(default=False)

    # The field used for user login
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    def __str__(self) -> str:
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True

    def get_full_name(self):
        return str(f"{self.first_name} {self.last_name}")

    def get_role(self):
        if self.role == self.Designer:
            return "Designer"
        elif self.role == self.Reception:
            return "Reception"
        elif self.role == self.SuperDesigner:
            return "SuperDesigner"
        elif self.role == self.Delivered:
            return "Delivered"
        else:
            return "Admin"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)
    profile_pic = models.ImageField(
        upload_to="user/profile_picture",
        blank=True,
        null=True,
    )
    address = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:

        if self.user:
            return f"{self.user.email}"
        else:
            return "No user associated"


class ChatMassage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="receiver"
    )

    message = models.CharField(max_length=1000)
    is_read = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        verbose_name_plural = "Messages"

    def __str__(self):
        return f"{self.sender} - {self.receiver}"

    @property
    def sender_profile(self):
        sender_profile = UserProfile.objects.get(user=self.sender)
        return sender_profile

    @property
    def receiver_profile(self):
        receiver_profile = UserProfile.objects.get(user=self.receiver)
        return receiver_profile


class Contact(models.Model):
    email = models.EmailField(unique=True, max_length=300)
    name = models.CharField(max_length=255)
    content = models.TextField()

    def __str__(self):
        return self.email
