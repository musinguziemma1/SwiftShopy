import { mutation } from "./_generated/server";

/**
 * SwiftShopy — Database Seed Mutation
 * Run this from the Convex dashboard or CLI:
 *   npx convex run seed:seedAll
 *
 * It inserts:
 *  - 2 demo users  (1 admin + 3 sellers)
 *  - 3 demo stores
 *  - 18 products   (6 per store, diverse Ugandan categories)
 *  - 12 orders     (mix of paid / pending / failed)
 *  - 12 transactions linked to those orders
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // ─── 1. USERS ─────────────────────────────────────────────────────────────
    const adminId = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@swiftshopy.com",
      passwordHash: "hashed_admin123",
      role: "admin",
      phone: "+256700000001",
      isActive: true,
    });

    const seller1Id = await ctx.db.insert("users", {
      name: "Sarah Nakato",
      email: "seller@swiftshopy.com",
      passwordHash: "hashed_seller123",
      role: "seller",
      phone: "+256772100001",
      isActive: true,
    });

    const seller2Id = await ctx.db.insert("users", {
      name: "Joseph Mugisha",
      email: "mugisha@swiftshopy.com",
      passwordHash: "hashed_pass456",
      role: "seller",
      phone: "+256752200002",
      isActive: true,
    });

    const seller3Id = await ctx.db.insert("users", {
      name: "Grace Apio",
      email: "apio@swiftshopy.com",
      passwordHash: "hashed_pass789",
      role: "seller",
      phone: "+256783300003",
      isActive: true,
    });

    // ─── 2. STORES ────────────────────────────────────────────────────────────
    const store1Id = await ctx.db.insert("stores", {
      userId: seller1Id,
      name: "Nakato Styles",
      slug: "nakato-styles",
      description: "Trendy African fashion, handbags & accessories for the modern Ugandan woman.",
      phone: "+256772100001",
      logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
      banner: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=300&fit=crop",
      isActive: true,
    });

    const store2Id = await ctx.db.insert("stores", {
      userId: seller2Id,
      name: "Mugisha Electronics",
      slug: "mugisha-electronics",
      description: "Quality phones, accessories, and smart gadgets — delivered across Kampala.",
      phone: "+256752200002",
      logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
      banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=300&fit=crop",
      isActive: true,
    });

    const store3Id = await ctx.db.insert("stores", {
      userId: seller3Id,
      name: "Apio's Kitchen",
      slug: "apios-kitchen",
      description: "Fresh homemade foods, packed lunches & catering — order via WhatsApp!",
      phone: "+256783300003",
      logo: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=100&h=100&fit=crop",
      banner: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=800&h=300&fit=crop",
      isActive: true,
    });

    // ─── 3. PRODUCTS ──────────────────────────────────────────────────────────

    // Store 1 — Nakato Styles (Fashion)
    const p1 = await ctx.db.insert("products", {
      storeId: store1Id,
      name: "Ankara Print Wrap Dress",
      description: "Vibrant Ankara fabric, knee-length, adjustable waist. One size fits most.",
      price: 85000,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
      stock: 20,
      isActive: true,
    });

    const p2 = await ctx.db.insert("products", {
      storeId: store1Id,
      name: "Leather Handbag – Caramel",
      description: "Genuine leather, spacious interior, gold-tone hardware. Perfect for work or outings.",
      price: 120000,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
      stock: 12,
      isActive: true,
    });

    const p3 = await ctx.db.insert("products", {
      storeId: store1Id,
      name: "Kitenge Shirt (Men)",
      description: "Custom Kitenge print, short-sleeve, available in S/M/L/XL.",
      price: 55000,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
      stock: 35,
      isActive: true,
    });

    const p4 = await ctx.db.insert("products", {
      storeId: store1Id,
      name: "Beaded Necklace Set",
      description: "Handcrafted Ugandan beadwork necklace & earring set. Great gift.",
      price: 35000,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
      stock: 50,
      isActive: true,
    });

    const p5 = await ctx.db.insert("products", {
      storeId: store1Id,
      name: "Platform Sandals – Black",
      description: "Faux leather platform sandals, 4cm heel, sizes 37–42.",
      price: 70000,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop",
      stock: 18,
      isActive: true,
    });

    const p6 = await ctx.db.insert("products", {
      storeId: store1Id,
      name: "Gomesi (Ladies Traditional)",
      description: "Classic Buganda Gomesi in royal blue with gold trim, custom sizing available.",
      price: 145000,
      image: "https://images.unsplash.com/photo-1566479179817-c0bd98b1a3be?w=400&h=400&fit=crop",
      stock: 8,
      isActive: true,
    });

    // Store 2 — Mugisha Electronics
    const p7 = await ctx.db.insert("products", {
      storeId: store2Id,
      name: "Samsung Galaxy A15 (4G)",
      description: "6.5\" display, 4GB RAM, 128GB storage, 5000mAh battery. Brand new, sealed.",
      price: 850000,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop",
      stock: 10,
      isActive: true,
    });

    const p8 = await ctx.db.insert("products", {
      storeId: store2Id,
      name: "Wireless Earbuds Pro",
      description: "Bluetooth 5.3, ANC, 30hr battery, water-resistant. Fits all phones.",
      price: 95000,
      image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?w=400&h=400&fit=crop",
      stock: 25,
      isActive: true,
    });

    const p9 = await ctx.db.insert("products", {
      storeId: store2Id,
      name: "20000mAh Power Bank",
      description: "Fast charge, dual USB-A + USB-C ports, LED indicator. Essential for load-shedding.",
      price: 75000,
      image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
      stock: 40,
      isActive: true,
    });

    const p10 = await ctx.db.insert("products", {
      storeId: store2Id,
      name: "Phone Screen Protector (Universal)",
      description: "Tempered glass, 9H hardness, fits screens up to 6.8\". Includes applicator.",
      price: 8000,
      image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop",
      stock: 200,
      isActive: true,
    });

    const p11 = await ctx.db.insert("products", {
      storeId: store2Id,
      name: "Laptop Cooling Pad",
      description: "Dual fans, USB-powered, adjustable height, fits laptops up to 17\".",
      price: 55000,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
      stock: 15,
      isActive: true,
    });

    const p12 = await ctx.db.insert("products", {
      storeId: store2Id,
      name: "Smart Watch Fitness Band",
      description: "Heart rate, steps, sleep tracking. Syncs with Android & iOS. 7-day battery.",
      price: 120000,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      stock: 22,
      isActive: true,
    });

    // Store 3 — Apio's Kitchen (Food)
    const p13 = await ctx.db.insert("products", {
      storeId: store3Id,
      name: "Rolex (Ugandan) – 2 Pack",
      description: "Fresh chapati rolled with eggs, veggies & sausage. Kampala's favourite street snack.",
      price: 8000,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
      stock: 100,
      isActive: true,
    });

    const p14 = await ctx.db.insert("products", {
      storeId: store3Id,
      name: "Packed Lunch – Office Special",
      description: "Rice/matooke + protein (beef/chicken) + greens + posho. Delivered to your office.",
      price: 12000,
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop",
      stock: 60,
      isActive: true,
    });

    const p15 = await ctx.db.insert("products", {
      storeId: store3Id,
      name: "Groundnut Stew (1L)",
      description: "Authentic Ugandan groundnut stew, freshly prepared daily. Includes free chapati.",
      price: 18000,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop",
      stock: 30,
      isActive: true,
    });

    const p16 = await ctx.db.insert("products", {
      storeId: store3Id,
      name: "Fresh Juice – Passion Fruit (500ml)",
      description: "100% natural passion fruit juice, no preservatives, chilled & ready to drink.",
      price: 5000,
      image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=400&fit=crop",
      stock: 80,
      isActive: true,
    });

    const p17 = await ctx.db.insert("products", {
      storeId: store3Id,
      name: "Mandazi Dozen",
      description: "Freshly fried mandazi (Ugandan doughnuts), lightly sweetened, perfect with chai.",
      price: 6000,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
      stock: 50,
      isActive: true,
    });

    const p18 = await ctx.db.insert("products", {
      storeId: store3Id,
      name: "Catering Package – 20 Pax",
      description: "Full buffet for 20 people: matooke, rice, meat, stews, salads & drinks. Advance order.",
      price: 450000,
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
      stock: 5,
      isActive: true,
    });

    // ─── 4. ORDERS ────────────────────────────────────────────────────────────
    const o1Id = await ctx.db.insert("orders", {
      storeId: store1Id,
      orderNumber: "SS-00101",
      customerName: "Aisha Nambi",
      customerPhone: "+256772400001",
      items: [{ productId: p1.toString(), productName: "Ankara Print Wrap Dress", price: 85000, quantity: 1, total: 85000 }],
      subtotal: 85000,
      total: 85000,
      status: "paid",
      notes: "Please deliver to Ntinda by 5pm",
    });

    const o2Id = await ctx.db.insert("orders", {
      storeId: store1Id,
      orderNumber: "SS-00102",
      customerName: "Brenda Atim",
      customerPhone: "+256752400002",
      items: [
        { productId: p2.toString(), productName: "Leather Handbag – Caramel", price: 120000, quantity: 1, total: 120000 },
        { productId: p4.toString(), productName: "Beaded Necklace Set", price: 35000, quantity: 2, total: 70000 },
      ],
      subtotal: 190000,
      total: 190000,
      status: "paid",
    });

    const o3Id = await ctx.db.insert("orders", {
      storeId: store1Id,
      orderNumber: "SS-00103",
      customerName: "Christine Achola",
      customerPhone: "+256783400003",
      items: [{ productId: p5.toString(), productName: "Platform Sandals – Black", price: 70000, quantity: 1, total: 70000 }],
      subtotal: 70000,
      total: 70000,
      status: "pending",
    });

    const o4Id = await ctx.db.insert("orders", {
      storeId: store1Id,
      orderNumber: "SS-00104",
      customerName: "Diana Nantume",
      customerPhone: "+256700400004",
      items: [{ productId: p6.toString(), productName: "Gomesi (Ladies Traditional)", price: 145000, quantity: 1, total: 145000 }],
      subtotal: 145000,
      total: 145000,
      status: "paid",
    });

    // Store 2 orders
    const o5Id = await ctx.db.insert("orders", {
      storeId: store2Id,
      orderNumber: "SS-00201",
      customerName: "Emmanuel Okello",
      customerPhone: "+256772500001",
      items: [{ productId: p7.toString(), productName: "Samsung Galaxy A15 (4G)", price: 850000, quantity: 1, total: 850000 }],
      subtotal: 850000,
      total: 850000,
      status: "paid",
      notes: "Call before delivery — Kireka area",
    });

    const o6Id = await ctx.db.insert("orders", {
      storeId: store2Id,
      orderNumber: "SS-00202",
      customerName: "Francis Tumwesige",
      customerPhone: "+256752500002",
      items: [
        { productId: p8.toString(), productName: "Wireless Earbuds Pro", price: 95000, quantity: 1, total: 95000 },
        { productId: p9.toString(), productName: "20000mAh Power Bank", price: 75000, quantity: 1, total: 75000 },
      ],
      subtotal: 170000,
      total: 170000,
      status: "paid",
    });

    const o7Id = await ctx.db.insert("orders", {
      storeId: store2Id,
      orderNumber: "SS-00203",
      customerName: "Gerald Ssemanda",
      customerPhone: "+256783500003",
      items: [{ productId: p12.toString(), productName: "Smart Watch Fitness Band", price: 120000, quantity: 1, total: 120000 }],
      subtotal: 120000,
      total: 120000,
      status: "failed",
      notes: "MTN MoMo payment timed out",
    });

    const o8Id = await ctx.db.insert("orders", {
      storeId: store2Id,
      orderNumber: "SS-00204",
      customerName: "Harriet Kyomuhendo",
      customerPhone: "+256700500004",
      items: [
        { productId: p10.toString(), productName: "Phone Screen Protector (Universal)", price: 8000, quantity: 3, total: 24000 },
        { productId: p11.toString(), productName: "Laptop Cooling Pad", price: 55000, quantity: 1, total: 55000 },
      ],
      subtotal: 79000,
      total: 79000,
      status: "paid",
    });

    // Store 3 orders
    const o9Id = await ctx.db.insert("orders", {
      storeId: store3Id,
      orderNumber: "SS-00301",
      customerName: "Ivan Kato",
      customerPhone: "+256772600001",
      items: [
        { productId: p14.toString(), productName: "Packed Lunch – Office Special", price: 12000, quantity: 5, total: 60000 },
        { productId: p16.toString(), productName: "Fresh Juice – Passion Fruit (500ml)", price: 5000, quantity: 5, total: 25000 },
      ],
      subtotal: 85000,
      total: 85000,
      status: "paid",
      notes: "Deliver to Total Energies House, Nakasero — 12:30pm",
    });

    const o10Id = await ctx.db.insert("orders", {
      storeId: store3Id,
      orderNumber: "SS-00302",
      customerName: "Joan Namutebi",
      customerPhone: "+256752600002",
      items: [{ productId: p13.toString(), productName: "Rolex (Ugandan) – 2 Pack", price: 8000, quantity: 4, total: 32000 }],
      subtotal: 32000,
      total: 32000,
      status: "paid",
    });

    const o11Id = await ctx.db.insert("orders", {
      storeId: store3Id,
      orderNumber: "SS-00303",
      customerName: "Kenneth Lutwama",
      customerPhone: "+256783600003",
      items: [{ productId: p18.toString(), productName: "Catering Package – 20 Pax", price: 450000, quantity: 1, total: 450000 }],
      subtotal: 450000,
      total: 450000,
      status: "pending",
      notes: "Event on Saturday 15th, venue: Munyonyo — confirm 48hrs before",
    });

    const o12Id = await ctx.db.insert("orders", {
      storeId: store3Id,
      orderNumber: "SS-00304",
      customerName: "Lydia Akello",
      customerPhone: "+256700600004",
      items: [
        { productId: p15.toString(), productName: "Groundnut Stew (1L)", price: 18000, quantity: 2, total: 36000 },
        { productId: p17.toString(), productName: "Mandazi Dozen", price: 6000, quantity: 3, total: 18000 },
      ],
      subtotal: 54000,
      total: 54000,
      status: "paid",
    });

    // ─── 5. TRANSACTIONS ──────────────────────────────────────────────────────
    await ctx.db.insert("transactions", {
      orderId: o1Id,
      storeId: store1Id,
      amount: 85000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240301-001",
      externalRef: "SS-EXT-00101",
      status: "successful",
      customerPhone: "+256772400001",
      metadata: { channel: "whatsapp", confirmationCode: "C001" },
    });

    await ctx.db.insert("transactions", {
      orderId: o2Id,
      storeId: store1Id,
      amount: 190000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240302-002",
      externalRef: "SS-EXT-00102",
      status: "successful",
      customerPhone: "+256752400002",
      metadata: { channel: "direct", confirmationCode: "C002" },
    });

    await ctx.db.insert("transactions", {
      orderId: o3Id,
      storeId: store1Id,
      amount: 70000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240303-003",
      externalRef: "SS-EXT-00103",
      status: "pending",
      customerPhone: "+256783400003",
      metadata: { channel: "whatsapp" },
    });

    await ctx.db.insert("transactions", {
      orderId: o4Id,
      storeId: store1Id,
      amount: 145000,
      currency: "UGX",
      provider: "airtel_money",
      providerRef: "AIRTEL-TXN-20240304-004",
      externalRef: "SS-EXT-00104",
      status: "successful",
      customerPhone: "+256700400004",
      metadata: { channel: "direct", confirmationCode: "C004" },
    });

    await ctx.db.insert("transactions", {
      orderId: o5Id,
      storeId: store2Id,
      amount: 850000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240305-005",
      externalRef: "SS-EXT-00201",
      status: "successful",
      customerPhone: "+256772500001",
      metadata: { channel: "whatsapp", confirmationCode: "C005", delivery: "boda" },
    });

    await ctx.db.insert("transactions", {
      orderId: o6Id,
      storeId: store2Id,
      amount: 170000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240306-006",
      externalRef: "SS-EXT-00202",
      status: "successful",
      customerPhone: "+256752500002",
      metadata: { channel: "direct", confirmationCode: "C006" },
    });

    await ctx.db.insert("transactions", {
      orderId: o7Id,
      storeId: store2Id,
      amount: 120000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240307-007",
      externalRef: "SS-EXT-00203",
      status: "failed",
      customerPhone: "+256783500003",
      metadata: { channel: "whatsapp", failureReason: "PAYER_NOT_FOUND" },
    });

    await ctx.db.insert("transactions", {
      orderId: o8Id,
      storeId: store2Id,
      amount: 79000,
      currency: "UGX",
      provider: "airtel_money",
      providerRef: "AIRTEL-TXN-20240308-008",
      externalRef: "SS-EXT-00204",
      status: "successful",
      customerPhone: "+256700500004",
      metadata: { channel: "direct", confirmationCode: "C008" },
    });

    await ctx.db.insert("transactions", {
      orderId: o9Id,
      storeId: store3Id,
      amount: 85000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240309-009",
      externalRef: "SS-EXT-00301",
      status: "successful",
      customerPhone: "+256772600001",
      metadata: { channel: "whatsapp", confirmationCode: "C009", deliveryNote: "Office lunch" },
    });

    await ctx.db.insert("transactions", {
      orderId: o10Id,
      storeId: store3Id,
      amount: 32000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240310-010",
      externalRef: "SS-EXT-00302",
      status: "successful",
      customerPhone: "+256752600002",
      metadata: { channel: "direct", confirmationCode: "C010" },
    });

    await ctx.db.insert("transactions", {
      orderId: o11Id,
      storeId: store3Id,
      amount: 450000,
      currency: "UGX",
      provider: "mtn_momo",
      providerRef: "MTN-TXN-20240311-011",
      externalRef: "SS-EXT-00303",
      status: "pending",
      customerPhone: "+256783600003",
      metadata: { channel: "whatsapp", eventDate: "2024-03-15", venue: "Munyonyo" },
    });

    await ctx.db.insert("transactions", {
      orderId: o12Id,
      storeId: store3Id,
      amount: 54000,
      currency: "UGX",
      provider: "airtel_money",
      providerRef: "AIRTEL-TXN-20240312-012",
      externalRef: "SS-EXT-00304",
      status: "successful",
      customerPhone: "+256700600004",
      metadata: { channel: "direct", confirmationCode: "C012" },
    });

    return {
      success: true,
      summary: {
        users: 4,
        stores: 3,
        products: 18,
        orders: 12,
        transactions: 12,
        totalRevenue: "UGX 2,045,000",
      },
    };
  },
});
