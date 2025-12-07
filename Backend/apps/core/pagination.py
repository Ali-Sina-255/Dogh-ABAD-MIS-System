from rest_framework.pagination import PageNumberPagination


class PharmaceuticalPagination(PageNumberPagination):
    page_size = 10
    page_query_param = "size"


class TestTypePagination(PageNumberPagination):
    page_size = 10
    page_query_param = "size"
