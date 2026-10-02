from rest_framework.throttling import SimpleRateThrottle


class ClientIpThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view) -> str:
        return self.cache_format % {
            "scope": self.scope,
            "ident": self.get_ident(request),
        }


class PlanThrottle(ClientIpThrottle):
    scope = "plan"


class SearchThrottle(ClientIpThrottle):
    scope = "search"
