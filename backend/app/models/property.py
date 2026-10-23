from pydantic import BaseModel
from typing import List, Dict, Optional

class ManagerInfo(BaseModel):
    id: str
    name: str
    email: Optional[str] = ""
    initials: Optional[str] = ""
    color: Optional[str] = ""

class PropertyCreate(BaseModel):
    name: str
    location: str
    managers: List[str] = []
    otaLinks: Dict[str, str] = {}

class ArchivePropertyRequest(BaseModel):
    isArchived: bool = True

class PropertyResponse(BaseModel):
    id: str
    name: str
    location: str
    managers: List[str]
    managerDetails: Optional[List[ManagerInfo]] = []
    otaLinks: Optional[Dict[str, str]] = {}
    createdAt: Optional[str] = ""
    isArchived: Optional[bool] = False
    archivedAt: Optional[str] = None
    archivedBy: Optional[str] = None
