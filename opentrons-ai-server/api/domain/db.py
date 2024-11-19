import structlog
import boto3
import uuid
import sys
from api.settings import Settings


from typing import List, Any
settings: Settings = Settings()
logger = structlog.stdlib.get_logger(settings.logger_name)
conn = None
client = None

class History(dict):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    pass
  
class DATABASE:
  def __init__(self, settings) -> None:
    self.settings: Settings = settings
    logger.info("Database Type", extra={"db_type": settings.db_type})
    dynamodb = boto3.resource(
      'dynamodb',
      aws_access_key_id= self.settings.aws_access_key,
      aws_secret_access_key= self.settings.aws_secret_key,
      region_name= self.settings.aws_region
    )
    self.table = dynamodb.Table(self.settings.ddb_table_history)
    print(self.settings.ddb_table_history)
    print(self.settings.aws_access_key)
    print(self.settings.aws_secret_key)
    print(self.settings.aws_region)
    pass

  def list_history(self, org_id: int) -> Any:
    try:
        logger.info("Fetching data from ddb")
        response = self.table.scan()
        data = response['Items']
        while 'LastEvaluatedKey' in response:
          response = self.table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
          data.extend(response['Items'])
        return data
    except Exception as e:
        print(e)
        pass
  
  def save_history(self, org_id:str, user_id:str, message: str) -> None:
    try:
      logger.info("Writing to DDB", extra={
          "item": {
            "id": str(uuid.uuid4()),
            "org_id": org_id,
            "user_id": user_id,
            "prompt": message
          }
      })
      self.table.put_item(
        Item={
              "id": str(uuid.uuid4()),
              "org_id": org_id,
              "user_id": user_id,
              "prompt": message
        }
      )

    except Exception as e:
        pass
    pass
