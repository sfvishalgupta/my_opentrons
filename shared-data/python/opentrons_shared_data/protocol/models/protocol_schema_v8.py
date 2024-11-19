from enum import Enum
from typing import Any, List, Optional, Dict
from typing_extensions import Literal

from pydantic import BaseModel, Field, Extra

from opentrons_shared_data.labware.labware_definition import LabwareDefinition
from opentrons_shared_data.command import known_schema_ids

from .shared_models import (
    Liquid,
    Metadata,
    DesignerApplication,
    Robot,
)


class Command(BaseModel):
    commandType: str
    params: Dict[str, Any]
    key: Optional[str]


class CommandAnnotation(BaseModel):
    commandKeys: List[str]
    annotationType: str

    class Config:
        extra = Extra.allow


CommandSchemaId = Enum(  # type: ignore[misc]
    "CommandSchemaId", ((schema_id, schema_id) for schema_id in known_schema_ids())
)


class ProtocolSchemaV8(BaseModel):
    otSharedSchema: Literal["#/protocol/schemas/8"] = Field(
        ...,
        alias="$otSharedSchema",
        description="The path to a valid Opentrons shared schema relative to "
        "the shared-data directory, without its extension.",
    )
    schemaVersion: Literal[8]
    metadata: Metadata
    robot: Robot
    liquidSchemaId: Literal["opentronsLiquidSchemaV1"]
    liquids: Dict[str, Liquid]
    labwareDefinitionSchemaId: Literal["opentronsLabwareSchemaV2"]
    labwareDefinitions: Dict[str, LabwareDefinition]
    commandSchemaId: CommandSchemaId
    commands: List[Command]
    commandAnnotationSchemaId: Literal["opentronsCommandAnnotationSchemaV1"]
    commandAnnotations: List[CommandAnnotation]
    designerApplication: Optional[DesignerApplication]

    class Config:
        # added for constructing the class with field name instead of alias
        allow_population_by_field_name = True
