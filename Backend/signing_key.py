import random
from datetime import datetime


def generate_secret_key():
    # Generate the first three digits randomly between 1 and 999
    first_three_digits = str(random.randint(1, 999)).zfill(3)

    # Get the current date in the Jalali (Persian) calendar
    current_jalali_date = jdatetime.datetime.now()

    # The fixed year part (last 2 digits of the current Jalali year)
    year_part = str(current_jalali_date.year)[
        -2:
    ]  

    current_date = datetime.now()
    month_part = current_date.strftime("%m")  # Get the two-digit month
    day_part = current_date.strftime("%d")  # Get the two-digit day

    # Combine all parts to form the secret key
    secret_key = f"{first_three_digits}{year_part}{month_part}{day_part}"

    return secret_key


# Example usage
print(
    generate_secret_key()
)  # Example output: 00104091110 (depending on the current month and day)
