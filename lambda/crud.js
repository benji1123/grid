// https://www.youtube.com/watch?v=Ut5CkSz6NR0&ab_channel=FelixYu

const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-west-2",
});

// table
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "everything-everywhere-all-at-once-db";
const ITEM_ID_COL = "id";

// api
const HEALTH_PATH = "/health";
const ITEM_PATH = "/item";
const ITEMS_PATH = "/items";

exports.handler = async (event) => {
  console.log(`Request event: ${JSON.stringify(event)}`);
  let response;
  switch (true) {
    case event.routeKey === `GET ${HEALTH_PATH}`:
      response = buildResponse(200);
      break;
    case event.routeKey === `GET ${ITEMS_PATH}`:
      response = await getItems();
      break;
    case event.routeKey === `GET ${ITEM_PATH}`:
      response = await getItem(event.queryStringParameters.productId);
      break;
    case event.routeKey === `POST ${ITEM_PATH}`:
      response = await saveItem(JSON.parse(event.body));
      break;
    case event.routeKey === `PATCH ${ITEM_PATH}`:
      const requestBody = JSON.parse(event.body);
      response = await modifyItem(
        requestBody.productId,
        requestBody.updateKey,
        requestBody.updateValue
      );
      break;
    case event.routeKey === `DELETE ${ITEM_PATH}`:
      response = await deleteItem(JSON.parse(event.body).productId);
      break;
    default:
      response = buildResponse("404 Not Found");
      return response;
  }
  console.log(`response: ${JSON.stringify(response)}`);
  return response;
};

const getItem = async (itemId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      ITEM_ID_COL: itemId,
    },
  };
  return await db
    .get(params)
    .promise()
    .then(
      (response) => {
        return buildResponse(200, response.Item);
      },
      (error) => {
        console.error(`failed to retrieve item <${itemId}>`, error);
      }
    );
};

const getItems = async () => {
  const params = {
    TableName: TABLE_NAME,
  };
  const allItems = await scanDynamoRecords(params, []);
  const body = {
    items: allItems,
  };
  return buildResponse(200, body);
};

const scanDynamoRecords = async (scanParams, itemArr) => {
  try {
    const dynamoData = await db.scan(scanParams).promise();
    itemArr = itemArr.concat(dynamoData.Items);
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArr);
    }
    return itemArr;
  } catch (error) {
    console.error("get all items failed", error);
  }
};

const saveItem = async (requestBody) => {
  const params = {
    TableName: TABLE_NAME,
    Item: requestBody,
  };
  return await db
    .put(params)
    .promise()
    .then(
      () => {
        const body = {
          Operation: "SAVE",
          Message: "SUCCESS",
          Item: requestBody,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.error("save item failed", error);
      }
    );
};

const modifyItem = async (itemId, updateKey, updateValue) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      ITEM_ID_COL: itemId,
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ":value": updateValue,
    },
    ReturnValues: "UPDATED_NEW",
  };
  return await db
    .update(params)
    .promise()
    .then(
      ((response) => {
        const body = {
          Operation: "UPDATE",
          Message: "SUCCESS",
          UpdatedAttributes: response,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.error("update item failed", error);
      })
    );
};

const deleteItem = async (itemId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      ITEM_ID_COL: itemId,
    },
    ReturnValues: "ALL_OLD",
  };
  return await db
    .delete(params)
    .promise()
    .then(
      (response) => {
        const body = {
          Operation: "DELETE",
          Message: "SUCCESS",
          Item: response,
        };
        buildResponse(200, body);
      },
      (error) => {
        console.error("delete item failed", error);
      }
    );
};

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};
