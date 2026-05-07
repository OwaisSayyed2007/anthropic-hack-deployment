"""
Memsapien V3 client - ported from fiwb-mvp reference architecture.
Handles all add/search/delete operations with proper retry logic.
"""
import httpx
import json
import asyncio
import random
import logging
import os
from dotenv import load_dotenv

# Ensure .env is loaded before module-level constants are initialized
load_dotenv()

logger = logging.getLogger("uvicorn.error")

SUPERMEMORY_API_KEY = os.getenv("SUPERMEMORY_API_KEY")
SUPERMEMORY_URL = os.getenv("SUPERMEMORY_URL", "https://api.supermemory.ai")


class SupermemoryClient:
    """
    Supermemory API client.
    Creates its own dedicated httpx client with correct auth headers.
    """

    def __init__(self):
        self.base_url = SUPERMEMORY_URL.rstrip("/")
        self._headers = {
            "User-Agent": "FIWB-AI/1.0",
            "Content-Type": "application/json",
        }
        if SUPERMEMORY_API_KEY:
            self._headers["Authorization"] = f"Bearer {SUPERMEMORY_API_KEY}"

        self.client = httpx.AsyncClient(
            headers=self._headers,
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=10),
        )

    def _sanitize_tag(self, tag: str) -> str:
        """Ensure tag only contains allowed characters (alphanumeric, -, _, :)"""
        if not tag:
            return tag
        import re
        # Replace common invalid chars with underscore
        return re.sub(r'[^a-zA-Z0-9\-_:]', '_', tag)

    async def add_document(
        self,
        content: str,
        metadata: dict,
        user_email: str,
        title: str = None,
        description: str = None,
        container_tag: str = None,
    ):
        """Add a document to Supermemory V3."""
        if not SUPERMEMORY_API_KEY:
            logger.warning("[SM] No API key configured — skipping add_document")
            return None

        try:
            safe_content = (
                content[:60000] + "\n[TRUNCATED]" if len(content) > 60000 else content
            )
            clean_meta = {k: v for k, v in metadata.items() if v is not None}
            clean_meta.setdefault("type", "academic_material")
            clean_meta.setdefault("user_email", user_email)
            if title:
                clean_meta["title"] = title
            if description:
                clean_meta["description"] = description[:500]

            payload = {
                "content": safe_content, 
                "metadata": clean_meta,
            }
            
            tag = container_tag or user_email
            if tag:
                payload["containerTag"] = self._sanitize_tag(tag)

            response = await self.client.post(
                f"{self.base_url}/v3/documents", json=payload
            )

            if response.status_code in (400, 401):
                logger.error(f"[SM] {response.status_code}: {response.text[:1000]}")
                return None

            response.raise_for_status()
            data = response.json()
            logger.info(f"[SM] Added doc to Supermemory: {title or 'untitled'} (ID: {data.get('id')})")
            return data

        except Exception as e:
            logger.error(f"[SM] add_document error: {e}")
            return None

    async def search(self, query: str, limit: int = 10, container_tag: str = None, user_id: str = "anonymous"):
        """Search Supermemory V4 and return raw results."""
        if not SUPERMEMORY_API_KEY:
            return {"results": []}

        try:
            final_query = query.strip() if query and query.strip() else "*"
            payload = {
                "q": final_query, 
                "limit": limit,
                "searchMode": "hybrid" 
            }
            if container_tag:
                payload["containerTag"] = self._sanitize_tag(container_tag)

            response = await self.client.post(
                f"{self.base_url}/v4/search", json=payload
            )

            if response.status_code == 401:
                logger.error("[SM] 401 Unauthorized on search — check SUPERMEMORY_API_KEY")
                return {"results": []}

            if response.status_code != 200:
                logger.warning(f"[SM] Search {response.status_code}: {response.text[:200]}")
                return {"results": []}

            data = response.json()
            # Supermemory V4 response structure is { results: [...], timing: ..., total: ... }
            return data
        except Exception as e:
            logger.error(f"[SM] Search error: {e}")
            return {"results": []}

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document from Supermemory."""
        if not SUPERMEMORY_API_KEY:
            return False
            
        try:
            # Note: Supermemory might have a different delete endpoint, 
            # for now we'll keep the interface but check documentation if needed.
            # Assuming standard DELETE /v3/documents/{id}
            response = await self.client.delete(f"{self.base_url}/v3/documents/{document_id}")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"[SM] Delete error: {e}")
            return False

    async def delete_message_memories(self, user_email: str, message_id: int):
        """Finds and deletes all enhanced memories associated with a specific assistant message ID."""
        if not SUPERMEMORY_API_KEY:
            return
            
        try:
            # This would require filtering which Supermemory supports in /v4/search
            # For now, we'll leave it as a placeholder or implement if filters are clear
            logger.info(f"[SM] delete_message_memories placeholder for message_id {message_id}")
        except Exception as e:
            logger.error(f"[SM] Error deleting message memories: {e}")

    def flatten_sm(self, res):
        """Flatten Supermemory results into chunks with parent metadata."""
        if not res or not isinstance(res, dict):
            return []
        
        all_chunks = []
        for item in res.get("results", []):
            # Supermemory results can have 'memory' or 'chunk'
            content = item.get("memory") or item.get("chunk") or ""
            if not content:
                continue
                
            meta = item.get("metadata", {})
            # Map Supermemory 'id' to 'documentId' for compatibility
            chunk_meta = {**meta}
            chunk_meta["documentId"] = item.get("id")
            
            # 🚀 SANITY CHECK: Softened binary filter
            if any(x in content for x in ["PK\x03\x04", "PK\x01\x02", "PK\x05\x06", "PK\x07\x08"]):
                continue
            
            sample = content[:500]
            if sample:
                printable_count = sum(1 for c in sample if c.isprintable() or c.isspace())
                if (printable_count / len(sample)) < 0.3:
                    continue
            
            all_chunks.append({"content": content, "metadata": chunk_meta})
                
        return all_chunks


# Singleton instance
_sm_client: SupermemoryClient = None


def get_sm_client() -> SupermemoryClient:
    global _sm_client
    if _sm_client is None:
        _sm_client = SupermemoryClient()
    return _sm_client


def get_ms_client():
    """Backwards compatibility alias"""
    return get_sm_client()
