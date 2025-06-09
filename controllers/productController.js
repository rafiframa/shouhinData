// controllers/productController.js 
const { Product } = require('../models');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res) => {
  try {
    // Extract search parameters from query
    const { search, product_type, sales_status, page, sort, order } = req.query;

    // Sorting parameters
    const sortField = sort || 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['id', 'product_name', 'product_type', 'sales_status', 'list_price', 'created_at'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'created_at';

    // Pagination settings
    const itemsPerPage = 25;
    const currentPage = parseInt(page) || 1;
    const offset = (currentPage - 1) * itemsPerPage;

    // Build where conditions
    const whereConditions = {};

    if (search && search.trim()) {
      const searchWords = search.trim().split(/\s+/); // split by spaces

      whereConditions[Op.and] = searchWords.map(word => ({
        [Op.or]: [
          { product_name: { [Op.iLike]: `%${word}%` } },
          { product_type: { [Op.iLike]: `%${word}%` } }
        ]
      }));
    }

    if (product_type && product_type.trim()) {
      whereConditions.product_type = product_type.trim();
    }

    if (sales_status && sales_status.trim()) {
      whereConditions.sales_status = sales_status.trim();
    }

    // Fetch products with filtering and pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      order: [[validSortField, sortOrder]], // Show newest first
      limit: itemsPerPage,
      offset: offset
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // Check for delete success message
    let notification = null;
    if (req.query.deleted) {
      notification = {
        type: 'success',
        message: `商品コード ${req.query.deleted} が正常に削除されました。`
      };
    }

    // Check for edit success message
    if (req.query.edited) {
      notification = {
        type: 'success',
        message: `商品コード ${req.query.edited} が正常に更新されました。`
      };
    }

    // Check for add success message
    if (req.query.added) {
      notification = {
        type: 'success',
        message: `商品コード ${req.query.added} が正常に追加されました。`
      };
    }

    res.render('products', {
      title: '商品データベース',
      products,
      notification,
      searchParams: {
        search: search || '',
        product_type: product_type || '',
        sales_status: sales_status || '',
        sort: sort || '',
        order: order || ''
      },
      pagination: {
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
        totalItems: count,
        itemsPerPage,
        startItem: offset + 1,
        endItem: Math.min(offset + itemsPerPage, count)
      },
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'データベースエラーが発生しました。'
    });
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ where: { id: slug } });

    if (!product) {
      return res.status(404).render('404', {
        title: 'Product Not Found',
        message: '商品が見つかりません',
        user: req.user
      });
    }

    res.render('productDetail', {
      title: product.product_name,
      product
    });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'データベースエラーが発生しました。'
    });
  }
};

exports.getEditProduct = async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ where: { id: slug } });

    if (!product) {
      return res.status(404).render('404', {
        title: 'Product Not Found',
        message: '商品が見つかりません'
      });
    }

    res.render('editProduct', {
      title: `編集: ${product.product_name}`,
      product
    });
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'データベースエラーが発生しました。'
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // Validate required fields
    const { product_code, product_name, list_price } = req.body;

    if (!product_code || !product_name || !list_price) {
      return res.status(400).json({
        success: false,
        message: '必須項目を入力してください。'
      });
    }

    // Check if product with the same code already exists
    const existingProduct = await Product.findOne({
      where: { product_code: product_code }
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: '同じ商品コードの商品が既に存在します。'
      });
    }

    // Prepare product data with timestamps
    const productData = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Create the product
    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: '商品が正常に追加されました。',
      product: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'データベースエラーが発生しました。'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    // Validate required fields
    const { product_name, list_price } = req.body;

    if (!product_name || !list_price) {
      return res.status(400).json({
        success: false,
        message: '必須項目を入力してください。'
      });
    }

    // Find the product first to confirm it exists
    const product = await Product.findOne({
      where: { id: id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品が見つかりません。'
      });
    }

    // Prepare update data with updated timestamp
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    // Update the product
    const [updatedRowsCount] = await Product.update(updateData, {
      where: { id: id }
    });

    if (updatedRowsCount === 0) {
      return res.status(400).json({
        success: false,
        message: '商品の更新に失敗しました。'
      });
    }

    // Fetch the updated product
    const updatedProduct = await Product.findOne({
      where: { id: id }
    });

    res.status(200).json({
      success: true,
      message: '商品が正常に更新されました。',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'データベースエラーが発生しました。'
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(req.params, "<===================================")

    // Find the product first to confirm it exists
    const product = await Product.findOne({
      where: { id: id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品が見つかりません。'
      });
    }

    // Delete the product
    await Product.destroy({
      where: { id: id }
    });

    res.status(200).json({
      success: true,
      message: '商品が正常に削除されました。'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'データベースエラーが発生しました。'
    });
  }
};


exports.getCertification = async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ where: { id: slug } });

    if (!product) {
      return res.status(404).render('404', {
        title: 'Product Not Found',
        message: '商品が見つかりません',
        user: req.user
      });
    }

    res.render('certification', {
      title: `品質証明書 - ${product.product_name}`,
      product,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching product for certification:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'データベースエラーが発生しました。'
    });
  }
};

exports.generateCertification = async (req, res) => {
  try {
    const slug = req.params.slug;
    const { customerName, certificationDate, selectedFields } = req.body;

    console.log(customerName)
    console.log(certificationDate)
    console.log(selectedFields)
    console.log(slug)

    const product = await Product.findOne({ where: { id: slug } });

    if (!product) {
      return res.status(404).render('404', {
        title: 'Product Not Found',
        message: '商品が見つかりません',
        user: req.user
      });
    }

    // Ensure selectedFields is an array
    const fieldsArray = Array.isArray(selectedFields) ? selectedFields : [selectedFields].filter(Boolean);

    // Always include product_name
    if (!fieldsArray.includes('product_name')) {
      fieldsArray.push('product_name');
    }

    // Format the date to Japanese format
    const formattedDate = formatToJapaneseDate(certificationDate);

    res.render('certificationDocument', {
      title: `品質証明書 - ${product.product_name}`,
      product,
      customerName,
      certificationDate,
      formattedDate,
      selectedFields: fieldsArray
    });
  } catch (error) {
    console.error('Error generating certification:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'データベースエラーが発生しました。'
    });
  }

  // Function to convert date to Japanese era format
  function formatToJapaneseDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Convert to Reiwa era (Reiwa started May 1, 2019)
    let era = '';
    let eraYear = 0;

    if (year >= 2019) {
      era = '令和';
      eraYear = year - 2018; // Reiwa 1 = 2019
    } else if (year >= 1989) {
      era = '平成';
      eraYear = year - 1988; // Heisei 1 = 1989
    } else {
      era = '昭和';
      eraYear = year - 1925; // Showa 1 = 1926
    }

    return `${era}${eraYear}年　${month}月　${day}日`;
  }

};