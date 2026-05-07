import asyncio
import os
import sys
from dotenv import load_dotenv
load_dotenv()
from app.intelligence.ms_client import get_sm_client

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

async def run():
    sm = get_sm_client()
    print("--- Adding Test Document to Supermemory ---")
    res = await sm.add_document('test content for supermemory', {'type': 'test_doc'}, 'test@example.com', 'Supermemory Test Doc')
    print('Add Response:', res)
    
    print("\n--- Waiting 3 seconds for indexing... ---")
    await asyncio.sleep(3)
    
    print("\n--- Searching for Test Document ---")
    res_search = await sm.search('supermemory', limit=5)
    print(f"Total results: {res_search.get('total')}")
    
    flattened = sm.flatten_sm(res_search)
    print(f"Flattened results: {len(flattened)}")
    for i, item in enumerate(flattened[:3]):
        print(f"[{i}] {item['content'][:100]}... (ID: {item['metadata'].get('documentId')})")

if __name__ == "__main__":
    asyncio.run(run())
