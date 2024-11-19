"""Deck data resource provider."""
from dataclasses import dataclass
from typing import List, Optional, cast
from typing_extensions import final

import anyio

from opentrons_shared_data.deck import (
    load as load_deck,
    DEFAULT_DECK_DEFINITION_VERSION,
)
from opentrons_shared_data.deck.types import DeckDefinitionV5
from opentrons.protocols.models import LabwareDefinition
from opentrons.types import DeckSlotName

from ..types import (
    DeckSlotLocation,
    DeckType,
    LabwareLocation,
    AddressableAreaLocation,
    DeckConfigurationType,
)
from .labware_data_provider import LabwareDataProvider
from ..resources import deck_configuration_provider


@final
@dataclass(frozen=True)
class DeckFixedLabware:
    """A labware fixture that is always present on a deck."""

    labware_id: str
    location: LabwareLocation
    definition: LabwareDefinition


class DeckDataProvider:
    """Provider class to wrap deck definition and data retrieval."""

    _labware_data: LabwareDataProvider

    def __init__(
        self, deck_type: DeckType, labware_data: Optional[LabwareDataProvider] = None
    ) -> None:
        """Initialize a DeckDataProvider."""
        self._deck_type = deck_type
        self._labware_data = labware_data or LabwareDataProvider()

    async def get_deck_definition(self) -> DeckDefinitionV5:
        """Get a labware definition given the labware's identification."""

        def sync() -> DeckDefinitionV5:
            return load_deck(
                name=self._deck_type.value, version=DEFAULT_DECK_DEFINITION_VERSION
            )

        return await anyio.to_thread.run_sync(sync)

    async def get_deck_fixed_labware(
        self,
        load_fixed_trash: bool,
        deck_definition: DeckDefinitionV5,
        deck_configuration: Optional[DeckConfigurationType] = None,
    ) -> List[DeckFixedLabware]:
        """Get a list of all labware fixtures from a given deck definition."""
        labware: List[DeckFixedLabware] = []

        for fixture in deck_definition["locations"]["legacyFixtures"]:
            labware_id = fixture["id"]
            load_name = cast(Optional[str], fixture.get("labware"))
            slot = cast(Optional[str], fixture.get("slot"))

            if (
                deck_configuration is not None
                and load_name is not None
                and slot is not None
                and slot not in DeckSlotName._value2member_map_
            ):
                # The provided slot is likely to be an addressable area for Module-required labware Eg: Plate Reader Lid
                for (
                    cutout_id,
                    cutout_fixture_id,
                    opentrons_module_serial_number,
                ) in deck_configuration:
                    provided_addressable_areas = (
                        deck_configuration_provider.get_provided_addressable_area_names(
                            cutout_fixture_id=cutout_fixture_id,
                            cutout_id=cutout_id,
                            deck_definition=deck_definition,
                        )
                    )
                    if slot in provided_addressable_areas:
                        addressable_area_location = AddressableAreaLocation(
                            addressableAreaName=slot
                        )
                        definition = await self._labware_data.get_labware_definition(
                            load_name=load_name,
                            namespace="opentrons",
                            version=1,
                        )

                        labware.append(
                            DeckFixedLabware(
                                labware_id=labware_id,
                                definition=definition,
                                location=addressable_area_location,
                            )
                        )

            elif (
                load_fixed_trash
                and load_name is not None
                and slot is not None
                and slot in DeckSlotName._value2member_map_
            ):
                deck_slot_location = DeckSlotLocation(
                    slotName=DeckSlotName.from_primitive(slot)
                )
                definition = await self._labware_data.get_labware_definition(
                    load_name=load_name,
                    namespace="opentrons",
                    version=1,
                )

                labware.append(
                    DeckFixedLabware(
                        labware_id=labware_id,
                        definition=definition,
                        location=deck_slot_location,
                    )
                )

        return labware
