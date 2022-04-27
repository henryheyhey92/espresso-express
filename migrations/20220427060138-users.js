'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('users', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true },
    first_name: { type: 'string', length: 100, notNull: true },
    last_name: { type: 'string', length: 100, notNull: true },
    address: { type: 'string', length: 200, notNull: false },
    country: { type: 'string', length: 100, notNull: false },
    email: { type: 'string', length: 100, notNull: true },
    phone: { type: 'string', length: 20, notNull: true },
    password: { type: 'string', length: 100, notNull: true },
    confirm_password: { type: 'string', length: 100, notNull: true },
    user_type: { type: 'string', length: 2 }
  })
};

exports.down = function (db) {
  return db.dropTable('users')
};

exports._meta = {
  "version": 1
};
