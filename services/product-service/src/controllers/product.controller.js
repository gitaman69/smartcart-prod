const Product = require('../models/product');

// GET /api/products  — paginated + search
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products  — admin only
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/products/:id  — admin only
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/products/:id  — admin only (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};