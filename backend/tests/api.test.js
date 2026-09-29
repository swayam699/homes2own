const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Online Food Ordering System - Integration & API Test Suite', () => {
  let customerToken = '';
  let customerId = null;
  let adminToken = '';
  let restaurantId = null;
  let menuItemId = null;
  let cartItemId = null;
  let createdOrderId = null;

  beforeAll(async () => {
    // Ensure DB connection is initialized
    await db.getDbConnection();
  });

  afterAll(async () => {
    await db.close();
  });

  // -------------------------------------------------------------
  // 1. Health check
  // -------------------------------------------------------------
  describe('Health API', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  // -------------------------------------------------------------
  // 2. Authentication Tests (Registration & Login)
  // -------------------------------------------------------------
  describe('Authentication Endpoints', () => {
    const testEmail = `tester_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    it('should register a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'College Evaluator',
          email: testEmail,
          password: testPassword,
          phone: '+91 98765 00000',
          address: '404 Campus Road, Tech Park',
          city: 'Mumbai',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.role).toBe('customer');

      customerToken = res.body.token;
      customerId = res.body.user.id;
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should log in customer with valid credentials and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'IncorrectPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should log in demo admin account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });
  });

  // -------------------------------------------------------------
  // 3. Restaurants Retrieval & Filtering
  // -------------------------------------------------------------
  describe('Restaurants Endpoints', () => {
    it('should retrieve list of all active restaurants', async () => {
      const res = await request(app).get('/api/restaurants');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      restaurantId = res.body.data[0].id;
    });

    it('should filter restaurants by cuisine', async () => {
      const res = await request(app).get('/api/restaurants?cuisine=Indian');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((r) => r.cuisine_types.includes('Indian'))).toBe(true);
    });

    it('should retrieve restaurant details with full menu categories', async () => {
      const res = await request(app).get(`/api/restaurants/${restaurantId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(restaurantId);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories.length).toBeGreaterThan(0);

      // Find first available menu item
      const firstCat = res.body.data.categories.find((c) => c.items && c.items.length > 0);
      if (firstCat && firstCat.items.length > 0) {
        menuItemId = firstCat.items[0].id;
      }
    });
  });

  // -------------------------------------------------------------
  // 4. Menu Retrieval & Search
  // -------------------------------------------------------------
  describe('Menu Endpoints', () => {
    it('should search dishes by query', async () => {
      const res = await request(app).get('/api/menu?search=Biryani');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name.toLowerCase()).toContain('biryani');
    });

    it('should retrieve single menu item by ID', async () => {
      const res = await request(app).get(`/api/menu/${menuItemId || 1}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(menuItemId || 1);
    });
  });

  // -------------------------------------------------------------
  // 5. Cart Operations
  // -------------------------------------------------------------
  describe('Cart Endpoints', () => {
    it('should return empty cart initially for new customer', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCount).toBe(0);
    });

    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          menuItemId: menuItemId || 1,
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.totalCount).toBe(2);

      cartItemId = res.body.data.items[0].id;
    });

    it('should update cart item quantity', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCount).toBe(3);
    });
  });

  // -------------------------------------------------------------
  // 6. Coupon Application
  // -------------------------------------------------------------
  describe('Coupon Endpoints', () => {
    it('should validate and apply active coupon code WELCOME50', async () => {
      const res = await request(app)
        .post('/api/coupons/apply')
        .send({
          code: 'WELCOME50',
          subtotal: 500,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('WELCOME50');
      expect(res.body.data.discount).toBeGreaterThan(0);
    });

    it('should reject invalid coupon code', async () => {
      const res = await request(app)
        .post('/api/coupons/apply')
        .send({
          code: 'NON_EXISTENT_COUPON',
          subtotal: 500,
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 7. Order Placement & Order Retrieval
  // -------------------------------------------------------------
  describe('Order Operations', () => {
    it('should place an order successfully from cart items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddress: 'Flat 101, Marine Drive, Mumbai',
          customerPhone: '+91 98765 00000',
          paymentMethod: 'upi',
          couponCode: 'WELCOME50',
          notes: 'Ring bell twice',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBeDefined();
      expect(res.body.data.orderNumber).toBeDefined();
      expect(res.body.data.status).toBe('placed');

      createdOrderId = res.body.data.orderId;
    });

    it('should retrieve customer order history including newly created order', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(createdOrderId);
    });

    it('should retrieve order details with live tracking timeline', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdOrderId);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(Array.isArray(res.body.data.tracking)).toBe(true);
      expect(res.body.data.tracking.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------
  // 8. Admin Authorization & Protected Operations
  // -------------------------------------------------------------
  describe('Admin Authorization & Dashboard', () => {
    it('should reject access to admin stats for unauthorized request', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('should forbid customer role from accessing admin stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should permit admin role to access dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCustomers).toBeDefined();
      expect(res.body.data.totalRestaurants).toBeDefined();
      expect(res.body.data.totalOrders).toBeDefined();
    });

    it('should allow admin to update order status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'confirmed',
          description: 'Kitchen confirmed test order',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });
  });
});
