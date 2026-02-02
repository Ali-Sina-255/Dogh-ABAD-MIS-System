import datetime

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def send_email_notification(request, user, email_subject, email_template, link=None):
    # Get the current site and protocol (HTTP or HTTPS)
    current_site = get_current_site(request)
    protocol = "https" if request.is_secure() else "http"

    # Generate the uid and token for user activation or password reset
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    # If link is provided, it's for password reset, otherwise for account activation
    if link is None:
        # Generate activation link for new user account activation
        activation_link = (
            f"{protocol}://{current_site.domain}/users/activate/{uid}/{token}/"
        )
        email_message = render_to_string(
            email_template,
            {
                "user": user,
                "domain": current_site.domain,
                "uid": uid,
                "token": token,
                "activation_link": activation_link,  # Pass the full URL here
                "current_year": datetime.datetime.now().year,
            },
        )
    else:
        # Generate reset link for password reset email
        email_message = render_to_string(
            email_template,
            {
                "user": user,
                "domain": current_site.domain,
                "uid": uid,
                "token": token,
                "link": link,  # For password reset link
            },
        )

    # Prepare the email message
    email = EmailMessage(
        subject=email_subject,
        body=email_message,
        to=[user.email],
    )
    email.content_subtype = "html"  # Send as HTML email
    email.send()

    print(f"Sent email to {user.email} with subject: {email_subject}")




def send_admin_notification(request, contact, email_subject, email_template):
    current_site = get_current_site(request)
    protocol = "https" if request.is_secure() else "http"

    email_message = render_to_string(
        email_template,
        {
            "user_name": contact.name,
            "user_email": contact.email,
            "user_message": contact.content,
            "domain": current_site.domain,
            "current_year": datetime.datetime.now().year,
        },
    )

    # Prepare the email for the admin
    admin_email = settings.ADMIN_EMAIL  # Assuming admin's email is stored in settings
    email = EmailMessage(
        subject=email_subject,
        body=email_message,
        to=[admin_email],
    )
    email.content_subtype = "html"  # Send as HTML email
    email.send()

    print(f"Sent email to {admin_email} with subject: {email_subject}")
