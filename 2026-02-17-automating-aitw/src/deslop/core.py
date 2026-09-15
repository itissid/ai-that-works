"""Core document deslopper logic."""

from baml_client import b


async def deslop_document(document: str) -> str:
    """Rewrite a document so it sounds less generic and AI-generated."""
    patterns = await b.IdentifyDocumentSlop(document=document)
    return await b.RewriteDocumentWithoutSlop(document=document, patterns=patterns)
