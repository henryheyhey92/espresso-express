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

exports.up = function(db) {
  return db.createTable('certificates_products',{
    'id': {'type':'int', 'primaryKey':true, 'autoIncrement':true, 'unsigned':true},
    'product_id':{
      'type':'int',
      'notNull':true,
      'unsigned':true,
      'foreignKey':{
        'name':'certificates_products_product_fk',
        'table':'products',
        'mapping':'id',
        'rules':{
          'onDelete':'CASCADE',
          'onUpdate':'RESTRICT'
        }
      },
     
    },
    'certificate_id':{
      'type':'int',
      'notNull':true,
      'unsigned':true,
      'foreignKey':{
        'name':'certificates_products_certificate_fk',
        'table':'certificates',
        'mapping':'id',
        'rules':{
          'onDelete':'CASCADE',
          'onUpdate':'RESTRICT'
        }
      }
    }
  })
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
