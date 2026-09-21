from pydantic import BaseModel
from typing import List, Dict

class PropertyCreate(BaseModel):
    name: str
    location: str
    managers: List[str] = []
    otaLinks: Dict[str, str] = {}

class PropertyResponse(BaseModel):
    id: str
    name: str
    location: str
    managers: List[str]
    otaLinks: Dict[str, str]
    createdAt: str
