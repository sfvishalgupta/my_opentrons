"""Plate Filler Protocol for Zymobiomics DNA Extraction."""
from opentrons import protocol_api
from abr_testing.protocols.helpers import (
    load_common_liquid_setup_labware_and_instruments,
)


metadata = {
    "protocolName": "PVT1ABR10 Liquids: ZymoBIOMICS Magbead DNA Extraction",
    "author": "Rhyann Clarke <rhyann.clarke@opentrons.com>",
    "source": "Protocol Library",
}

requirements = {
    "robotType": "Flex",
    "apiLevel": "2.20",
}


def run(protocol: protocol_api.ProtocolContext) -> None:
    """Protocol."""
    # Initiate Labware
    (
        source_reservoir,
        tip_rack,
        p1000,
    ) = load_common_liquid_setup_labware_and_instruments(protocol)

    res1 = protocol.load_labware("nest_12_reservoir_15ml", "C3", "R1")
    res2 = protocol.load_labware("nest_12_reservoir_15ml", "B3", "R2")

    lysis_and_pk = (3200 + 320) / 8
    beads_and_binding = (275 + 6600) / 8
    binding2 = 5500 / 8
    wash1 = 5500 / 8
    final_elution = 2100 / 8
    wash2 = 9000 / 8
    wash3 = 9000 / 8
    # Fill up Plates
    # Res1
    p1000.transfer(
        volume=[lysis_and_pk, beads_and_binding, binding2, wash1, final_elution],
        source=source_reservoir["A1"].bottom(z=0.2),
        dest=[
            res1["A1"].top(),
            res1["A2"].top(),
            res1["A5"].top(),
            res1["A7"].top(),
            res1["A12"].top(),
        ],
        blow_out=True,
        blowout_location="source well",
        trash=False,
    )
    # Res2
    p1000.transfer(
        volume=[wash2, wash3],
        source=source_reservoir["A1"],
        dest=[res2["A1"].top(), res2["A7"].top()],
        blow_out=True,
        blowout_location="source well",
        trash=False,
    )
