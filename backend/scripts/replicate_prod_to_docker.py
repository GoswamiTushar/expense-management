"""
Replication Script: Production MongoDB Atlas -> Local Docker MongoDB
Replicates all collections and indexes from production Atlas to local Docker MongoDB (airbnb_expenses_dev).
"""

import os
import sys
import asyncio
from pathlib import Path
from dotenv import dotenv_values
from motor.motor_asyncio import AsyncIOMotorClient

# Setup paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROD_ENV_FILE = BACKEND_DIR / ".env.production"
LOCAL_ENV_FILE = BACKEND_DIR / ".env"

async def replicate():
    # 1. Load production credentials
    env_source = PROD_ENV_FILE if PROD_ENV_FILE.exists() else LOCAL_ENV_FILE
    if not env_source.exists():
        print(f"[Error] Neither {PROD_ENV_FILE} nor {LOCAL_ENV_FILE} found.")
        sys.exit(1)

    prod_config = dotenv_values(env_source)
    prod_uri = prod_config.get("MONGODB_URI")
    prod_db_name = prod_config.get("DB_NAME", "airbnb_expenses")

    if not prod_uri or "mongodb" not in prod_uri:
        print("[Error] Invalid or missing MONGODB_URI in config.")
        sys.exit(1)

    local_uri = os.getenv("LOCAL_MONGO_URI", "mongodb://127.0.0.1:27017")
    local_db_name = os.getenv("LOCAL_DB_NAME", "airbnb_expenses_dev")

    print("\n=======================================================")
    print("[Sync] MongoDB Atlas -> Local Docker Replication")
    print("=======================================================")
    print(f"Source (Prod): {prod_db_name} on Atlas")
    print(f"Target (Dev) : {local_db_name} on {local_uri}")
    print("=======================================================\n")

    prod_client = AsyncIOMotorClient(prod_uri, serverSelectionTimeoutMS=10000)
    local_client = AsyncIOMotorClient(local_uri, serverSelectionTimeoutMS=5000)

    # Test connections
    try:
        await prod_client.admin.command("ping")
        print("[OK] Connected to Production MongoDB Atlas successfully.")
    except Exception as e:
        print(f"[FAIL] Failed to connect to Production Atlas: {e}")
        sys.exit(1)

    try:
        await local_client.admin.command("ping")
        print("[OK] Connected to Local Docker MongoDB successfully.\n")
    except Exception as e:
        print(f"[FAIL] Failed to connect to Local Docker MongoDB at {local_uri}: {e}")
        print("   Make sure Docker container 'mongo-dev' is running on port 27017.")
        sys.exit(1)

    prod_db = prod_client[prod_db_name]
    local_db = local_client[local_db_name]

    # Get collection names
    all_collections = await prod_db.list_collection_names()
    collections = [c for c in all_collections if not c.startswith("system.")]

    print(f"Found {len(collections)} collections to replicate: {collections}\n")
    print(f"{'Collection':<25} | {'Prod Docs':<12} | {'Local Docs':<12} | Status")
    print("-" * 65)

    total_cloned = 0
    for col_name in sorted(collections):
        source_col = prod_db[col_name]
        dest_col = local_db[col_name]

        # Fetch all documents from prod
        docs = await source_col.find({}).to_list(10000)
        prod_count = len(docs)

        # Clear destination collection
        await dest_col.delete_many({})

        if docs:
            await dest_col.insert_many(docs)
            total_cloned += prod_count

        # Clone indexes (except default _id_)
        try:
            indexes = await source_col.index_information()
            for idx_name, idx_info in indexes.items():
                if idx_name == "_id_":
                    continue
                keys = idx_info["key"]
                options = {k: v for k, v in idx_info.items() if k not in ("key", "v", "ns")}
                await dest_col.create_index(keys, **options)
        except Exception as idx_err:
            print(f"  [Notice] Could not copy index for {col_name}: {idx_err}")

        dest_count = await dest_col.count_documents({})
        status = "[MATCH]" if prod_count == dest_count else "[MISMATCH]"
        print(f"{col_name:<25} | {prod_count:<12} | {dest_count:<12} | {status}")

    print("-" * 65)
    print(f"[Done] Replication complete! Total {total_cloned} documents replicated into '{local_db_name}'.\n")

if __name__ == "__main__":
    asyncio.run(replicate())
