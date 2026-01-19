from pydantic import BaseModel
from typing import List

class BomChild(BaseModel):
    id: str

class BomRow(BaseModel):
    child: BomChild
    quantity: int
    unit: str

class BomCreate(BaseModel):
    parentPart: BomChild
    rows: List[BomRow]
