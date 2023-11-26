import { MongoClient } from "mongodb";
import { mongoConfig } from "./settings.js";
let _connection = undefined;
let _db = underfined;

const dbConnection = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }
  return _db;
};
