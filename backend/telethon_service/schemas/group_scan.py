from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class KOLInfo(BaseModel):
    user_id: int
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    is_admin: bool

class GroupScan(BaseModel):
    channel_id: int
    title: str
    username: Optional[str]
    description: Optional[str]
    member_count: Optional[int]
    active_members: Optional[int]
    bot_count: Optional[int]
    kol_count: Optional[int]
    kol_details: List[KOLInfo] = Field(default_factory=list)
    scanned_at: datetime
    
    class Config:
        schema_extra = {
            "example": {
                "channel_id": 123456789,
                "title": "Test Channel",
                "username": "testchannel",
                "description": "A test channel",
                "member_count": 1000,
                "active_members": 500,
                "bot_count": 10,
                "kol_count": 2,
                "kol_details": [
                    {
                        "user_id": 12345,
                        "username": "influencer1",
                        "first_name": "John",
                        "last_name": "Doe",
                        "is_admin": True
                    }
                ],
                "scanned_at": "2024-03-19T12:00:00Z"
            }
        } 