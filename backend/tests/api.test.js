const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('HOMES2OWN Real Estate Consultancy Platform - Integration & API Test Suite', () => {
  let customerToken = '';
  let customerId = null;
  let consultantToken = '';
  let adminToken = '';
  let samplePropertyId = 1;
  let createdEnquiryId = null;
  let createdSiteVisitId = null;

  beforeAll(async () => {
    // Initialize database
    await db.getDbConnection();
  });

  afterAll(async () => {
    await db.close();
  });

  // -------------------------------------------------------------
  // 1. Health check & Brand verification
  // -------------------------------------------------------------
  describe('Health API', () => {
    it('should return 200 and healthy status for HOMES2OWN platform', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toContain('HOMES2OWN');
      expect(res.body.market).toContain('Mumbai');
    });
  });

  // -------------------------------------------------------------
  // 2. Authentication & Authorization Tests
  // -------------------------------------------------------------
  describe('Customer Authentication Endpoints', () => {
    const testEmail = `mumbai_buyer_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    it('should register a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Vikramaditya Oberoi',
          email: testEmail,
          password: testPassword,
          phone: '+91 98200 44556',
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

    it('should reject registration with duplicate email address', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Buyer',
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
      expect(res.body.user.password_hash).toBeUndefined(); // Never expose password hash
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should log in demo consultant account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'consultant@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('consultant');
      consultantToken = res.body.token;
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

    it('should retrieve current authenticated user with /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testEmail);
    });
  });

  // -------------------------------------------------------------
  // 3. Properties Discovery, Search & Filters
  // -------------------------------------------------------------
  describe('Properties Endpoints', () => {
    it('should retrieve property listings with pagination metadata', async () => {
      const res = await request(app).get('/api/properties');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.properties)).toBe(true);
      expect(res.body.properties.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();

      samplePropertyId = res.body.properties[0].id;
    });

    it('should search properties by keyword (e.g. Bandra)', async () => {
      const res = await request(app).get('/api/properties?search=Bandra');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBeGreaterThan(0);
      const match = res.body.properties.some(
        (p) =>
          p.title.includes('Bandra') ||
          p.location_name.includes('Bandra') ||
          p.address.includes('Bandra')
      );
      expect(match).toBe(true);
    });

    it('should filter properties by configuration (e.g. 4 BHK)', async () => {
      const res = await request(app).get('/api/properties?configuration=4%20BHK');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.every((p) => p.configuration === '4 BHK')).toBe(true);
    });

    it('should filter properties by transaction type (Buy / Rent)', async () => {
      const res = await request(app).get('/api/properties?transaction_type=Rent');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.every((p) => p.transaction_type === 'Rent')).toBe(true);
    });

    it('should sort properties by price ascending', async () => {
      const res = await request(app).get('/api/properties?sort=price_asc');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      if (res.body.properties.length > 1) {
        expect(res.body.properties[0].price).toBeLessThanOrEqual(res.body.properties[1].price);
      }
    });

    it('should retrieve full property details including gallery, developer, and amenities', async () => {
      const res = await request(app).get(`/api/properties/${samplePropertyId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.property.id).toBe(samplePropertyId);
      expect(Array.isArray(res.body.property.images)).toBe(true);
      expect(Array.isArray(res.body.property.amenities)).toBe(true);
      expect(res.body.property.location_name).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 4. Mumbai Locations & Developers
  // -------------------------------------------------------------
  describe('Locations & Developers Endpoints', () => {
    it('should retrieve 20 Mumbai localities with live property counts', async () => {
      const res = await request(app).get('/api/locations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.locations)).toBe(true);
      expect(res.body.locations.length).toBeGreaterThanOrEqual(10);
      expect(res.body.locations[0].name).toBeDefined();
    });

    it('should retrieve developer profiles', async () => {
      const res = await request(app).get('/api/developers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.developers)).toBe(true);
      expect(res.body.developers.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------
  // 5. Favourites Operations (Persisted in Database)
  // -------------------------------------------------------------
  describe('Favourites Endpoints', () => {
    it('should add property to user favourites', async () => {
      const res = await request(app)
        .post(`/api/favourites/${samplePropertyId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should handle duplicate favourites idempotently without error', async () => {
      const res = await request(app)
        .post(`/api/favourites/${samplePropertyId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should check if property is favourite', async () => {
      const res = await request(app)
        .get(`/api/favourites/check/${samplePropertyId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.isFavourite).toBe(true);
    });

    it('should retrieve customer saved favourites list', async () => {
      const res = await request(app)
        .get('/api/favourites')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.favourites.length).toBeGreaterThan(0);
      expect(res.body.favourites.some((f) => f.id === samplePropertyId)).toBe(true);
    });

    it('should remove property from favourites', async () => {
      const res = await request(app)
        .delete(`/api/favourites/${samplePropertyId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 6. Property Comparisons Tray
  // -------------------------------------------------------------
  describe('Comparisons Endpoints', () => {
    it('should add property to comparison tray', async () => {
      const res = await request(app)
        .post(`/api/comparisons/${samplePropertyId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should retrieve comparisons list with side-by-side specs', async () => {
      const res = await request(app)
        .get('/api/comparisons')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.comparisons.length).toBeGreaterThan(0);
    });

    it('should remove property from comparison tray', async () => {
      const res = await request(app)
        .delete(`/api/comparisons/${samplePropertyId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 7. Enquiries Intake & Consultant CRM Processing
  // -------------------------------------------------------------
  describe('Enquiries Endpoints', () => {
    it('should allow customer or guest to submit an enquiry', async () => {
      const res = await request(app)
        .post('/api/enquiries')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Vikramaditya Oberoi',
          email: 'vikramaditya@example.com',
          phone: '+91 98200 11223',
          property_id: samplePropertyId,
          preferred_contact_method: 'phone',
          message: 'Interested in site inspection this upcoming weekend. Please arrange callback.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Thank you for your enquiry. A HOMES2OWN consultant will contact you shortly.');
      expect(res.body.enquiryId).toBeDefined();

      createdEnquiryId = res.body.enquiryId;
    });

    it('should allow customer to view their own submitted enquiries', async () => {
      const res = await request(app)
        .get('/api/enquiries/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.enquiries.length).toBeGreaterThan(0);
    });

    it('should allow consultant to view all enquiries and update status', async () => {
      const res = await request(app)
        .get('/api/enquiries')
        .set('Authorization', `Bearer ${consultantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Update enquiry status
      const updateRes = await request(app)
        .put(`/api/enquiries/${createdEnquiryId}`)
        .set('Authorization', `Bearer ${consultantToken}`)
        .send({ status: 'contacted' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 8. Site Visits & Scheduling
  // -------------------------------------------------------------
  describe('Site Visits Endpoints', () => {
    it('should submit a site visit request with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateString = futureDate.toISOString().split('T')[0];

      const res = await request(app)
        .post('/api/site-visits')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Vikramaditya Oberoi',
          email: 'vikramaditya@example.com',
          phone: '+91 98200 11223',
          property_id: samplePropertyId,
          preferred_date: dateString,
          preferred_time: '11:00 AM',
          visitor_count: 2,
          notes: 'Visiting with family.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.siteVisitId).toBeDefined();

      createdSiteVisitId = res.body.siteVisitId;
    });

    it('should reject site visit request with past date', async () => {
      const res = await request(app)
        .post('/api/site-visits')
        .send({
          name: 'Test Visitor',
          email: 'test@example.com',
          phone: '+91 98200 00000',
          property_id: samplePropertyId,
          preferred_date: '2020-01-01',
          preferred_time: '10:00 AM',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Site visit date must be today or a future date.');
    });

    it('should allow consultant to update site visit status and scheduling notes', async () => {
      const res = await request(app)
        .put(`/api/site-visits/${createdSiteVisitId}`)
        .set('Authorization', `Bearer ${consultantToken}`)
        .send({
          status: 'Approved',
          consultant_notes: 'Confirmed with developer sales gallery manager. Slot booked.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 9. Callbacks Request
  // -------------------------------------------------------------
  describe('Callback Endpoints', () => {
    it('should submit callback request', async () => {
      const res = await request(app)
        .post('/api/callbacks')
        .send({
          name: 'Aarav Mehta',
          phone: '+91 98203 99887',
          property_id: samplePropertyId,
          preferred_time: 'Evening 6 PM',
          message: 'Need loan eligibility information.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.callbackId).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 10. Consultant CRM Leads & Notes
  // -------------------------------------------------------------
  describe('Consultant CRM Leads', () => {
    let leadId = 1;

    it('should allow consultant to retrieve CRM pipeline leads', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${consultantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.leads)).toBe(true);
      expect(res.body.leads.length).toBeGreaterThan(0);
      leadId = res.body.leads[0].id;
    });

    it('should allow consultant to view lead details with notes and timeline', async () => {
      const res = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${consultantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.lead.id).toBe(leadId);
      expect(Array.isArray(res.body.lead.notes)).toBe(true);
    });

    it('should allow consultant to add internal note to lead', async () => {
      const res = await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .set('Authorization', `Bearer ${consultantToken}`)
        .send({ note: 'Followed up via telephone. Client requested structural layout PDF.' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should forbid customer from accessing CRM leads', async () => {
      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });
  });

  // -------------------------------------------------------------
  // 11. Admin Statistics & Role Restrictions
  // -------------------------------------------------------------
  describe('Admin Authorization & Metrics', () => {
    it('should reject unauthenticated access to admin stats', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('should forbid customer role from accessing admin stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to access dashboard metrics with computed closed-deal values', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.total_properties).toBeDefined();
      expect(res.body.stats.active_listings).toBeDefined();
      expect(res.body.stats.converted_leads).toBeDefined();
      expect(res.body.stats.closed_deal_value).toBeDefined();
    });

    it('should allow admin/consultant to retrieve Recharts analytics datasets', async () => {
      const res = await request(app)
        .get('/api/reports/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.analytics.top_locations).toBeDefined();
      expect(res.body.analytics.monthly_trends).toBeDefined();
    });
  });
});
