"""v7 of our SQLite schema."""
import enum
import sqlalchemy

from robot_server.persistence._utc_datetime import UTCDateTime

metadata = sqlalchemy.MetaData()


class PrimitiveParamSQLEnum(enum.Enum):
    """Enum type to store primitive param type."""

    INT = "int"
    FLOAT = "float"
    BOOL = "bool"
    STR = "str"


class ProtocolKindSQLEnum(enum.Enum):
    """What kind a stored protocol is."""

    STANDARD = "standard"
    QUICK_TRANSFER = "quick-transfer"


class DataFileSourceSQLEnum(enum.Enum):
    """The source this data file is from."""

    UPLOADED = "uploaded"
    GENERATED = "generated"


protocol_table = sqlalchemy.Table(
    "protocol",
    metadata,
    sqlalchemy.Column(
        "id",
        sqlalchemy.String,
        primary_key=True,
    ),
    sqlalchemy.Column(
        "created_at",
        UTCDateTime,
        nullable=False,
    ),
    sqlalchemy.Column("protocol_key", sqlalchemy.String, nullable=True),
    sqlalchemy.Column(
        "protocol_kind",
        sqlalchemy.Enum(
            ProtocolKindSQLEnum,
            values_callable=lambda obj: [e.value for e in obj],
            validate_strings=True,
            create_constraint=True,
        ),
        index=True,
        nullable=False,
    ),
)

analysis_table = sqlalchemy.Table(
    "analysis",
    metadata,
    sqlalchemy.Column(
        "id",
        sqlalchemy.String,
        primary_key=True,
    ),
    sqlalchemy.Column(
        "protocol_id",
        sqlalchemy.String,
        sqlalchemy.ForeignKey("protocol.id"),
        index=True,
        nullable=False,
    ),
    sqlalchemy.Column(
        "analyzer_version",
        sqlalchemy.String,
        nullable=False,
    ),
    sqlalchemy.Column(
        "completed_analysis",
        # Stores a JSON string. See CompletedAnalysisStore.
        sqlalchemy.String,
        nullable=False,
    ),
)

analysis_primitive_type_rtp_table = sqlalchemy.Table(
    "analysis_primitive_rtp_table",
    metadata,
    sqlalchemy.Column(
        "row_id",
        sqlalchemy.Integer,
        primary_key=True,
    ),
    sqlalchemy.Column(
        "analysis_id",
        sqlalchemy.ForeignKey("analysis.id"),
        nullable=False,
    ),
    sqlalchemy.Column(
        "parameter_variable_name",
        sqlalchemy.String,
        nullable=False,
    ),
    sqlalchemy.Column(
        "parameter_type",
        sqlalchemy.Enum(
            PrimitiveParamSQLEnum,
            values_callable=lambda obj: [e.value for e in obj],
            create_constraint=True,
            # todo(mm, 2024-09-24): Can we add validate_strings=True here?
        ),
        nullable=False,
    ),
    sqlalchemy.Column(
        "parameter_value",
        sqlalchemy.String,
        nullable=False,
    ),
)

analysis_csv_rtp_table = sqlalchemy.Table(
    "analysis_csv_rtp_table",
    metadata,
    sqlalchemy.Column(
        "row_id",
        sqlalchemy.Integer,
        primary_key=True,
    ),
    sqlalchemy.Column(
        "analysis_id",
        sqlalchemy.ForeignKey("analysis.id"),
        nullable=False,
    ),
    sqlalchemy.Column(
        "parameter_variable_name",
        sqlalchemy.String,
        nullable=False,
    ),
    sqlalchemy.Column(
        "file_id",
        sqlalchemy.ForeignKey("data_files.id"),
        nullable=True,
    ),
)

run_table = sqlalchemy.Table(
    "run",
    metadata,
    sqlalchemy.Column(
        "id",
        sqlalchemy.String,
        primary_key=True,
    ),
    sqlalchemy.Column(
        "created_at",
        UTCDateTime,
        nullable=False,
    ),
    sqlalchemy.Column(
        "protocol_id",
        sqlalchemy.String,
        sqlalchemy.ForeignKey("protocol.id"),
        nullable=True,
    ),
    sqlalchemy.Column(
        "state_summary",
        sqlalchemy.String,
        nullable=True,
    ),
    sqlalchemy.Column("engine_status", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("_updated_at", UTCDateTime, nullable=True),
    sqlalchemy.Column(
        "run_time_parameters",
        # Stores a JSON string. See RunStore.
        sqlalchemy.String,
        nullable=True,
    ),
)

action_table = sqlalchemy.Table(
    "action",
    metadata,
    sqlalchemy.Column(
        "id",
        sqlalchemy.String,
        primary_key=True,
    ),
    sqlalchemy.Column("created_at", UTCDateTime, nullable=False),
    sqlalchemy.Column("action_type", sqlalchemy.String, nullable=False),
    sqlalchemy.Column(
        "run_id",
        sqlalchemy.String,
        sqlalchemy.ForeignKey("run.id"),
        nullable=False,
    ),
)

run_command_table = sqlalchemy.Table(
    "run_command",
    metadata,
    sqlalchemy.Column("row_id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column(
        "run_id", sqlalchemy.String, sqlalchemy.ForeignKey("run.id"), nullable=False
    ),
    sqlalchemy.Column("index_in_run", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("command_id", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("command", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("command_intent", sqlalchemy.String, nullable=False, index=True),
    sqlalchemy.Index(
        "ix_run_run_id_command_id",  # An arbitrary name for the index.
        "run_id",
        "command_id",
        unique=True,
    ),
    sqlalchemy.Index(
        "ix_run_run_id_index_in_run",  # An arbitrary name for the index.
        "run_id",
        "index_in_run",
        unique=True,
    ),
)

data_files_table = sqlalchemy.Table(
    "data_files",
    metadata,
    sqlalchemy.Column(
        "id",
        sqlalchemy.String,
        primary_key=True,
    ),
    sqlalchemy.Column(
        "name",
        sqlalchemy.String,
        nullable=False,
    ),
    sqlalchemy.Column(
        "file_hash",
        sqlalchemy.String,
        nullable=False,
    ),
    sqlalchemy.Column(
        "created_at",
        UTCDateTime,
        nullable=False,
    ),
    sqlalchemy.Column(
        "source",
        sqlalchemy.Enum(
            DataFileSourceSQLEnum,
            values_callable=lambda obj: [e.value for e in obj],
            validate_strings=True,
            create_constraint=True,
        ),
        index=True,
        nullable=False,
    ),
)

run_csv_rtp_table = sqlalchemy.Table(
    "run_csv_rtp_table",
    metadata,
    sqlalchemy.Column(
        "row_id",
        sqlalchemy.Integer,
        primary_key=True,
    ),
    sqlalchemy.Column(
        "run_id",
        sqlalchemy.ForeignKey("run.id"),
        nullable=False,
    ),
    sqlalchemy.Column(
        "parameter_variable_name",
        sqlalchemy.String,
        nullable=False,
    ),
    sqlalchemy.Column(
        "file_id",
        sqlalchemy.ForeignKey("data_files.id"),
        nullable=True,
    ),
)


class BooleanSettingKey(enum.Enum):
    """Keys for boolean settings."""

    ENABLE_ERROR_RECOVERY = "enable_error_recovery"


boolean_setting_table = sqlalchemy.Table(
    "boolean_setting",
    metadata,
    sqlalchemy.Column(
        "key",
        sqlalchemy.Enum(
            BooleanSettingKey,
            values_callable=lambda obj: [e.value for e in obj],
            validate_strings=True,
            create_constraint=True,
        ),
        primary_key=True,
    ),
    sqlalchemy.Column(
        "value",
        sqlalchemy.Boolean,
        nullable=False,
    ),
)
