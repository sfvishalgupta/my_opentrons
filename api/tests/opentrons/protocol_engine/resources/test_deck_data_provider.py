"""Test deck data provider."""
import pytest
from pytest_lazyfixture import lazy_fixture  # type: ignore[import-untyped]
from decoy import Decoy

from opentrons_shared_data.deck.types import DeckDefinitionV5
from opentrons.protocols.models import LabwareDefinition
from opentrons.types import DeckSlotName

from opentrons.protocol_engine.types import (
    DeckSlotLocation,
    DeckType,
    DeckConfigurationType,
    AddressableAreaLocation,
)
from opentrons.protocol_engine.resources import (
    LabwareDataProvider,
    DeckDataProvider,
    DeckFixedLabware,
)


@pytest.fixture
def mock_labware_data_provider(decoy: Decoy) -> LabwareDataProvider:
    """Get a mock in the shape of the LabwareDataProvider."""
    return decoy.mock(cls=LabwareDataProvider)


@pytest.mark.parametrize(
    ("deck_type", "expected_definition"),
    [
        (DeckType.OT2_STANDARD, lazy_fixture("ot2_standard_deck_def")),
        (DeckType.OT2_SHORT_TRASH, lazy_fixture("ot2_short_trash_deck_def")),
        (DeckType.OT3_STANDARD, lazy_fixture("ot3_standard_deck_def")),
    ],
)
async def test_get_deck_definition(
    deck_type: DeckType,
    expected_definition: DeckDefinitionV5,
    mock_labware_data_provider: LabwareDataProvider,
) -> None:
    """It should be able to load the correct deck definition."""
    subject = DeckDataProvider(
        deck_type=deck_type, labware_data=mock_labware_data_provider
    )
    result = await subject.get_deck_definition()
    assert result == expected_definition


async def test_get_deck_labware_fixtures_ot2_standard(
    decoy: Decoy,
    ot2_standard_deck_def: DeckDefinitionV5,
    ot2_fixed_trash_def: LabwareDefinition,
    mock_labware_data_provider: LabwareDataProvider,
) -> None:
    """It should be able to get a list of prepopulated labware on the deck."""
    subject = DeckDataProvider(
        deck_type=DeckType.OT2_STANDARD, labware_data=mock_labware_data_provider
    )

    decoy.when(
        await mock_labware_data_provider.get_labware_definition(
            load_name="opentrons_1_trash_1100ml_fixed",
            namespace="opentrons",
            version=1,
        )
    ).then_return(ot2_fixed_trash_def)

    result = await subject.get_deck_fixed_labware(True, ot2_standard_deck_def, None)

    assert result == [
        DeckFixedLabware(
            labware_id="fixedTrash",
            location=DeckSlotLocation(slotName=DeckSlotName.FIXED_TRASH),
            definition=ot2_fixed_trash_def,
        )
    ]


async def test_get_deck_labware_fixtures_ot2_short_trash(
    decoy: Decoy,
    ot2_short_trash_deck_def: DeckDefinitionV5,
    ot2_short_fixed_trash_def: LabwareDefinition,
    mock_labware_data_provider: LabwareDataProvider,
) -> None:
    """It should be able to get a list of prepopulated labware on the deck."""
    subject = DeckDataProvider(
        deck_type=DeckType.OT2_SHORT_TRASH, labware_data=mock_labware_data_provider
    )

    decoy.when(
        await mock_labware_data_provider.get_labware_definition(
            load_name="opentrons_1_trash_850ml_fixed",
            namespace="opentrons",
            version=1,
        )
    ).then_return(ot2_short_fixed_trash_def)

    result = await subject.get_deck_fixed_labware(True, ot2_short_trash_deck_def, None)

    assert result == [
        DeckFixedLabware(
            labware_id="fixedTrash",
            location=DeckSlotLocation(slotName=DeckSlotName.FIXED_TRASH),
            definition=ot2_short_fixed_trash_def,
        )
    ]


async def test_get_deck_labware_fixtures_ot3_standard(
    decoy: Decoy,
    ot3_standard_deck_def: DeckDefinitionV5,
    ot3_fixed_trash_def: LabwareDefinition,
    mock_labware_data_provider: LabwareDataProvider,
) -> None:
    """It should be able to get a list of prepopulated labware on the deck."""
    subject = DeckDataProvider(
        deck_type=DeckType.OT3_STANDARD, labware_data=mock_labware_data_provider
    )

    decoy.when(
        await mock_labware_data_provider.get_labware_definition(
            load_name="opentrons_1_trash_3200ml_fixed",
            namespace="opentrons",
            version=1,
        )
    ).then_return(ot3_fixed_trash_def)

    result = await subject.get_deck_fixed_labware(True, ot3_standard_deck_def, None)

    assert result == [
        DeckFixedLabware(
            labware_id="fixedTrash",
            location=DeckSlotLocation(slotName=DeckSlotName.SLOT_A3),
            definition=ot3_fixed_trash_def,
        )
    ]


def _make_deck_config_with_plate_reader() -> DeckConfigurationType:
    return [
        ("cutoutA1", "singleLeftSlot", None),
        ("cutoutB1", "singleLeftSlot", None),
        ("cutoutC1", "singleLeftSlot", None),
        ("cutoutD1", "singleLeftSlot", None),
        ("cutoutA2", "singleCenterSlot", None),
        ("cutoutB2", "singleCenterSlot", None),
        ("cutoutC2", "singleCenterSlot", None),
        ("cutoutD2", "singleCenterSlot", None),
        ("cutoutA3", "singleRightSlot", None),
        ("cutoutB3", "singleRightSlot", None),
        ("cutoutC3", "singleRightSlot", None),
        ("cutoutD3", "absorbanceReaderV1", "abc123"),
    ]


async def test_get_deck_labware_fixtures_ot3_standard_for_plate_reader(
    decoy: Decoy,
    ot3_standard_deck_def: DeckDefinitionV5,
    ot3_absorbance_reader_lid: LabwareDefinition,
    mock_labware_data_provider: LabwareDataProvider,
) -> None:
    """It should get a lis including the Plate Reader Lid for our deck fixed labware."""
    subject = DeckDataProvider(
        deck_type=DeckType.OT3_STANDARD, labware_data=mock_labware_data_provider
    )

    decoy.when(
        await mock_labware_data_provider.get_labware_definition(
            load_name="opentrons_flex_lid_absorbance_plate_reader_module",
            namespace="opentrons",
            version=1,
        )
    ).then_return(ot3_absorbance_reader_lid)

    deck_config = _make_deck_config_with_plate_reader()

    result = await subject.get_deck_fixed_labware(
        False, ot3_standard_deck_def, deck_config
    )

    assert result == [
        DeckFixedLabware(
            labware_id="absorbanceReaderV1LidD3",
            location=AddressableAreaLocation(
                addressableAreaName="absorbanceReaderV1D3"
            ),
            definition=ot3_absorbance_reader_lid,
        )
    ]
