from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import OrderSerializer
from collections import deque
import time
from django.contrib.auth import get_user_model

User = get_user_model()

class OrderSystem:
    def __init__(self):
        self.orders = {} 
        self.order_queue = deque()  
        self.order_counter = 1  

    def generate_order_id(self):
        """Generate an incremental order ID."""
        order_id = f"ORD-{self.order_counter:06d}"
        self.order_counter += 1  
        return order_id

    def create_order(self):
        """Create an order and assign it to an available user."""
        order_id = self.generate_order_id()
        available_user = self.find_available_user()

        if available_user:
            available_user.is_free = False
            available_user.save()

            self.orders[order_id] = {"user": available_user, "status": "Assigned"}
            return order_id, available_user.first_name
        else:
            self.order_queue.append(order_id)
            return order_id, None

    def find_available_user(self):
        """Find an available user with is_free=True."""
        available_users = User.objects.filter(is_free=True, is_active=True)
        if available_users.exists():
            return available_users.first()
        return None

    def checkout_order(self, order_id):
        """Complete the checkout and mark the user as free again."""
        if order_id in self.orders:
            user = self.orders.pop(order_id)["user"]
            user.is_free = True
            user.save()
            return f"Order {order_id} completed by {user.first_name}"
        return None

order_system = OrderSystem()

class OrderCreateView(APIView):
    def post(self, request, *args, **kwargs):
        order_id, user_name = order_system.create_order()
        return Response(
            {"order_id": order_id, "user_assigned": user_name or "Waiting"},
            status=status.HTTP_201_CREATED,
        )

class OrderCheckoutView(APIView):
    def post(self, request, *args, **kwargs):
        order_id = request.data.get("order_id")
        result = order_system.checkout_order(order_id)
        if result:
            return Response({"message": result}, status=status.HTTP_200_OK)
        return Response({"message": f"Order {order_id} not found."}, status=status.HTTP_404_NOT_FOUND)

class OrderListView(APIView):
    def get(self, request, *args, **kwargs):
        orders = [
            {
                "order_id": order_id,
                "status": order["status"],
                "user_assigned": order["user"].first_name if order["user"] else None,
            }
            for order_id, order in order_system.orders.items()
        ]
        return Response(orders, status=status.HTTP_200_OK)
