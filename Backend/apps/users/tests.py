from django.test import SimpleTestCase

from . import calculator


class TestCalculator(SimpleTestCase):
    def test_add_number(self):
        """add tow number together"""
        result = calculator.add(5, 5)
        self.assertEqual(result, 10)

    def test_subtract_number(self):
        """subtract tow number"""
        result = calculator.subtract(30, 10)
        self.assertEqual(result, 20)
