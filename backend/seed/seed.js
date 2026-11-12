const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');

const { categories, products, coupons, users } = require('./seedData');

const seedDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('❌ MONGODB_URI not found in environment. Please set MONGODB_URI in backend/.env before running seed.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB Atlas.');

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Review.deleteMany({}),
      Wishlist.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ Cleared old data.');

    // 1. Seed Categories
    console.log('🌱 Seeding Categories...');
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ ${insertedCategories.length} categories created.`);

    // Map category slug to ObjectId
    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // 2. Seed Products
    console.log('🌱 Seeding Products...');
    const productsWithCategoryIds = products.map((prod) => {
      const categoryId = categoryMap[prod.categorySlug] || insertedCategories[0]._id;
      const { categorySlug, ...rest } = prod;
      return {
        ...rest,
        category: categoryId,
      };
    });

    const insertedProducts = await Product.insertMany(productsWithCategoryIds);
    console.log(`✅ ${insertedProducts.length} products created.`);

    // 3. Seed Users
    console.log('🌱 Seeding Users...');
    for (const u of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      await User.create({
        ...u,
        password: hashedPassword,
      });
    }
    console.log(`✅ ${users.length} users created (including Betasnacks Admin).`);

    // 4. Seed Coupons
    console.log('🌱 Seeding Coupons...');
    const insertedCoupons = await Coupon.insertMany(coupons);
    console.log(`✅ ${insertedCoupons.length} coupons created.`);

    console.log('\n=============================================');
    console.log('🎉 BETASNACKS DATABASE SEEDED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('👤 Admin login: admin@betasnacks.com | Admin@123');
    console.log('👤 Demo user 1: aarav@example.com | User@123');
    console.log('👤 Demo user 2: priya@example.com | User@123');
    console.log(`🍟 ${insertedProducts.length} food items ready to order.`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDB();

