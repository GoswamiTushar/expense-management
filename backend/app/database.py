import re, urllib.parse, dns.resolver
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]

_client = None

def get_sanitized_uri(uri: str) -> str:
    if not uri: return uri
    m = re.match(r"(mongodb(?:\+srv)?://)([^:]+):(.*)@([^/?]+)(.*)", uri)
    if m:
        scheme, user, raw_pass, host, rest = m.groups()
        if raw_pass.startswith("<") and raw_pass.endswith(">"):
            raw_pass = raw_pass[1:-1]
        clean_user = urllib.parse.quote_plus(urllib.parse.unquote_plus(user))
        clean_pass = urllib.parse.quote_plus(urllib.parse.unquote_plus(raw_pass))
        return f"{scheme}{clean_user}:{clean_pass}@{host}{rest}"
    return uri

def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            get_sanitized_uri(settings.mongodb_uri),
            serverSelectionTimeoutMS=20000,
            connectTimeoutMS=10000,
            maxPoolSize=20,
            minPoolSize=1,
            maxIdleTimeMS=45000,
            retryWrites=True,
        )
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
