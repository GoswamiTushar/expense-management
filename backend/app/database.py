import dns.resolver
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]

_client = None

def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongodb_uri)
    return _client

def get_db():
    return get_client()[settings.db_name]

async def ping_database() -> bool:
    try:
        await get_db().command("ping")
        return True
    except Exception as e:
        print(f"[DB Ping Error] {e}")
        return False
