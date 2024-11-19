"""Move to coordinates command request, result, and implementation models."""
from __future__ import annotations

from pydantic import Field
from typing import Optional, Type, TYPE_CHECKING
from typing_extensions import Literal


from ..state import update_types
from ..types import DeckPoint
from .pipetting_common import PipetteIdMixin, MovementMixin, DestinationPositionResult
from .command import AbstractCommandImpl, BaseCommand, BaseCommandCreate, SuccessData
from ..errors.error_occurrence import ErrorOccurrence

if TYPE_CHECKING:
    from ..execution import MovementHandler


MoveToCoordinatesCommandType = Literal["moveToCoordinates"]


class MoveToCoordinatesParams(PipetteIdMixin, MovementMixin):
    """Payload required to move a pipette to coordinates."""

    coordinates: DeckPoint = Field(
        ...,
        description="X, Y and Z coordinates in mm from deck's origin location (left-front-bottom corner of work space)",
    )


class MoveToCoordinatesResult(DestinationPositionResult):
    """Result data from the execution of a MoveToCoordinates command."""

    pass


class MoveToCoordinatesImplementation(
    AbstractCommandImpl[MoveToCoordinatesParams, SuccessData[MoveToCoordinatesResult]]
):
    """Move to coordinates command implementation."""

    def __init__(
        self,
        movement: MovementHandler,
        **kwargs: object,
    ) -> None:
        self._movement = movement

    async def execute(
        self, params: MoveToCoordinatesParams
    ) -> SuccessData[MoveToCoordinatesResult]:
        """Move the requested pipette to the requested coordinates."""
        state_update = update_types.StateUpdate()

        x, y, z = await self._movement.move_to_coordinates(
            pipette_id=params.pipetteId,
            deck_coordinates=params.coordinates,
            direct=params.forceDirect,
            additional_min_travel_z=params.minimumZHeight,
            speed=params.speed,
        )
        deck_point = DeckPoint.construct(x=x, y=y, z=z)
        state_update.pipette_location = update_types.PipetteLocationUpdate(
            pipette_id=params.pipetteId, new_location=None, new_deck_point=deck_point
        )

        return SuccessData(
            public=MoveToCoordinatesResult(position=DeckPoint(x=x, y=y, z=z)),
            state_update=state_update,
        )


class MoveToCoordinates(
    BaseCommand[MoveToCoordinatesParams, MoveToCoordinatesResult, ErrorOccurrence]
):
    """Move to well command model."""

    commandType: MoveToCoordinatesCommandType = "moveToCoordinates"
    params: MoveToCoordinatesParams
    result: Optional[MoveToCoordinatesResult]

    _ImplementationCls: Type[
        MoveToCoordinatesImplementation
    ] = MoveToCoordinatesImplementation


class MoveToCoordinatesCreate(BaseCommandCreate[MoveToCoordinatesParams]):
    """Move to coordinates command creation request model."""

    commandType: MoveToCoordinatesCommandType = "moveToCoordinates"
    params: MoveToCoordinatesParams

    _CommandCls: Type[MoveToCoordinates] = MoveToCoordinates
