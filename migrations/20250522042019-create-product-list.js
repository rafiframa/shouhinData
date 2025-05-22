'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_list', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      product_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      order_number: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      sales_status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      list_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      supplier_product_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      supplier_cost_local: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      supplier_cost_currency: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      dimensions_mm: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      weight_g: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      material: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      durability_years: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      jan_code: {
        type: Sequelize.STRING(13),
        allowNull: true
      },
      other_specs: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      label_link: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      packaging_link: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      manual_link: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      product_type: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_list');
  }
};