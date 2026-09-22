import time
from fastapi import Request

async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    print(f"[HTTP Request] {request.method} {request.url.path} -> {response.status_code} ({ms:.1f}ms)")
    return response
