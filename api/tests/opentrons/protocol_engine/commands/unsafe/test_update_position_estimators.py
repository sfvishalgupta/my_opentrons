"""Test update-position-estimator commands."""
from decoy import Decoy

from opentrons.protocol_engine.commands.unsafe.update_position_estimators import (
    UpdatePositionEstimatorsParams,
    UpdatePositionEstimatorsResult,
    UpdatePositionEstimatorsImplementation,
)
from opentrons.protocol_engine.commands.command import SuccessData
from opentrons.protocol_engine.execution import GantryMover
from opentrons.protocol_engine.types import MotorAxis
from opentrons.hardware_control import OT3HardwareControlAPI
from opentrons.hardware_control.types import Axis


async def test_update_position_estimators_implementation(
    decoy: Decoy, ot3_hardware_api: OT3HardwareControlAPI, gantry_mover: GantryMover
) -> None:
    """Test UnsafeBlowOut command execution."""
    subject = UpdatePositionEstimatorsImplementation(
        hardware_api=ot3_hardware_api, gantry_mover=gantry_mover
    )

    data = UpdatePositionEstimatorsParams(
        axes=[MotorAxis.LEFT_Z, MotorAxis.LEFT_PLUNGER, MotorAxis.X, MotorAxis.Y]
    )

    decoy.when(gantry_mover.motor_axis_to_hardware_axis(MotorAxis.LEFT_Z)).then_return(
        Axis.Z_L
    )
    decoy.when(
        gantry_mover.motor_axis_to_hardware_axis(MotorAxis.LEFT_PLUNGER)
    ).then_return(Axis.P_L)
    decoy.when(gantry_mover.motor_axis_to_hardware_axis(MotorAxis.X)).then_return(
        Axis.X
    )
    decoy.when(gantry_mover.motor_axis_to_hardware_axis(MotorAxis.Y)).then_return(
        Axis.Y
    )
    decoy.when(
        await ot3_hardware_api.update_axis_position_estimations(
            [Axis.Z_L, Axis.P_L, Axis.X, Axis.Y]
        )
    ).then_return(None)

    result = await subject.execute(data)

    assert result == SuccessData(public=UpdatePositionEstimatorsResult())

    decoy.verify(
        await ot3_hardware_api.update_axis_position_estimations(
            [Axis.Z_L, Axis.P_L, Axis.X, Axis.Y]
        ),
    )
