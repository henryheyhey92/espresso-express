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
  return db.createTable('orders', {
    id: { type: 'int', primaryKey: true, autoIncrement: true , unsigned:true},
    product_id: {
        type: 'int',
        notNull: true,
        unsigned: true,
        foreignKey: {
            name: 'orders_products_product_fk',
            table: 'products',
            rules: {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT'
            },
            mapping: 'id'
        }
    },
    user_id: {
        type: 'int',
        notNull: true,
        unsigned:true,
        foreignKey: {
            name: 'orders_products_user_fk',
            table: 'users',
            rules: {
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT'
            },
            mapping: 'id'
        }
    },
    order_date: { type: 'string', length: 100, notNull: true },
    status: { type: 'string', length: 100, notNull: true },
    shipping_address: { type: 'string', length: 1000, notNull: true },
    quantity: { type: 'int', unsigned: true, notNull: true },
    product_name: {type: 'string', length: 100, notNull: true },
    purchaser_name: {type: 'string', length: 100, notNull: true},
    product_image_url: {type: 'string', length: 1000, notNull: false}
    // price: { type: 'int', unsigned: true, notNull: true }
});
};

exports.down = function(db) {
  return db.dropTable('orders');
};

exports._meta = {
  "version": 1
};
