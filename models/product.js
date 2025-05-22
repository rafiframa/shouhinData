// models/product.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    order_number: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    sales_status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    list_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    supplier_product_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    supplier_cost_local: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    supplier_cost_currency: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    dimensions_mm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    weight_g: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    material: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    durability_years: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    jan_code: {
      type: DataTypes.STRING(13),
      allowNull: true
    },
    other_specs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    label_link: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    packaging_link: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manual_link: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    product_type: {
      type: DataTypes.TEXT,
      allowNull: true
    },    
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },    
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
  }, {
    tableName: 'product_list',
    timestamps: false
  });
  
  return Product;
};