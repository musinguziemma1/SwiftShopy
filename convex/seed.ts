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
       joinDate: Date.now(),
     });

     const seller1Id = await ctx.db.insert("users", {
       name: "Sarah Nakato",
       email: "seller@swiftshopy.com",
       passwordHash: "hashed_seller123",
       role: "seller",
       phone: "+256772100001",
       isActive: true,
       joinDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
     });

     const seller2Id = await ctx.db.insert("users", {
       name: "Joseph Mugisha",
       email: "mugisha@swiftshopy.com",
       passwordHash: "hashed_pass456",
       role: "seller",
       phone: "+256752200002",
       isActive: true,
       joinDate: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
     });

     const seller3Id = await ctx.db.insert("users", {
       name: "Grace Apio",
       email: "apio@swiftshopy.com",
       passwordHash: "hashed_pass789",
       role: "seller",
       phone: "+256783300003",
       isActive: true,
       joinDate: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
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
       sales: 234,
       category: "Fashion",
       isActive: true,
     });

     const p2 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Leather Handbag – Caramel",
       description: "Genuine leather, spacious interior, gold-tone hardware. Perfect for work or outings.",
       price: 120000,
       image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
       stock: 12,
       sales: 156,
       category: "Fashion",
       isActive: true,
     });

     const p3 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Kitenge Shirt (Men)",
       description: "Custom Kitenge print, short-sleeve, available in S/M/L/XL.",
       price: 55000,
       image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
       stock: 35,
       sales: 89,
       category: "Fashion",
       isActive: true,
     });

     const p4 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Beaded Necklace Set",
       description: "Handcrafted Ugandan beadwork necklace & earring set. Great gift.",
       price: 35000,
       image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
       stock: 50,
       sales: 78,
       category: "Fashion",
       isActive: true,
     });

     const p5 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Platform Sandals – Black",
       description: "Faux leather platform sandals, 4cm heel, sizes 37–42.",
       price: 70000,
       image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop",
       stock: 18,
       sales: 67,
       category: "Fashion",
       isActive: true,
     });

     const p6 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Gomesi (Ladies Traditional)",
       description: "Classic Buganda Gomesi in royal blue with gold trim, custom sizing available.",
       price: 145000,
       image: "https://images.unsplash.com/photo-1566479179817-c0bd98b1a3be?w=400&h=400&fit=crop",
       stock: 8,
       sales: 45,
       category: "Fashion",
       isActive: true,
     });

     const p19 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "African Print Headwrap",
       description: "Beautiful Ankara headwrap, can be styled multiple ways. Vibrant colors.",
       price: 25000,
       image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop",
       stock: 50,
       sales: 320,
       category: "Fashion",
       isActive: true,
     });

     const p20 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Handmade Bracelet Set",
       description: "Set of 5 handmade beaded bracelets. Mix and match colors.",
       price: 15000,
       image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
       stock: 100,
       sales: 450,
       category: "Fashion",
       isActive: true,
     });

     const p21 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Kikoy Sarong Wrap",
       description: "Authentic Kenyan kikoy sarong, multi-purpose wrap, lightweight cotton.",
       price: 35000,
       image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop",
       stock: 30,
       sales: 89,
       category: "Fashion",
       isActive: true,
     });

     const p22 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Beaded Choker Necklace",
       description: "Handcrafted beaded choker with traditional patterns, adjustable size.",
       price: 28000,
       image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
       stock: 35,
       sales: 127,
       category: "Fashion",
       isActive: true,
     });

     const p23 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Woven Tote Bag",
       description: "Sisal woven tote bag, eco-friendly, spacious interior, leather handles.",
       price: 95000,
       image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop",
       stock: 15,
       sales: 62,
       category: "Fashion",
       isActive: true,
     });

     const p24 = await ctx.db.insert("products", {
       storeId: store1Id,
       name: "Cashmere Blend Scarf",
       description: "Luxurious cashmere blend scarf, ultra-soft, perfect for cool evenings.",
       price: 65000,
       image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=400&fit=crop",
       stock: 22,
       sales: 78,
       category: "Fashion",
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
       sales: 45,
       category: "Electronics",
       isActive: true,
     });

     const p8 = await ctx.db.insert("products", {
       storeId: store2Id,
       name: "Wireless Earbuds Pro",
       description: "Bluetooth 5.3, ANC, 30hr battery, water-resistant. Fits all phones.",
       price: 95000,
       image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?w=400&h=400&fit=crop",
       stock: 25,
       sales: 234,
       category: "Electronics",
       isActive: true,
     });

     const p9 = await ctx.db.insert("products", {
       storeId: store2Id,
       name: "20000mAh Power Bank",
       description: "Fast charge, dual USB-A + USB-C ports, LED indicator. Essential for load-shedding.",
       price: 75000,
       image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
       stock: 40,
       sales: 112,
       category: "Electronics",
       isActive: true,
     });

     const p10 = await ctx.db.insert("products", {
       storeId: store2Id,
       name: "Phone Screen Protector (Universal)",
       description: "Tempered glass, 9H hardness, fits screens up to 6.8\". Includes applicator.",
       price: 8000,
       image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop",
       stock: 200,
       sales: 345,
       category: "Electronics",
       isActive: true,
     });

     const p11 = await ctx.db.insert("products", {
       storeId: store2Id,
       name: "Laptop Cooling Pad",
       description: "Dual fans, USB-powered, adjustable height, fits laptops up to 17\".",
       price: 55000,
       image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
       stock: 15,
       sales: 78,
       category: "Electronics",
       isActive: true,
     });

     const p12 = await ctx.db.insert("products", {
       storeId: store2Id,
       name: "Smart Watch Fitness Band",
       description: "Heart rate, steps, sleep tracking. Syncs with Android & iOS. 7-day battery.",
       price: 120000,
       image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
       stock: 22,
       sales: 189,
       category: "Electronics",
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
       sales: 234,
       category: "Food",
       isActive: true,
     });

     const p14 = await ctx.db.insert("products", {
       storeId: store3Id,
       name: "Packed Lunch – Office Special",
       description: "Rice/matooke + protein (beef/chicken) + greens + posho. Delivered to your office.",
       price: 12000,
       image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop",
       stock: 60,
       sales: 189,
       category: "Food",
       isActive: true,
     });

     const p15 = await ctx.db.insert("products", {
       storeId: store3Id,
       name: "Groundnut Stew (1L)",
       description: "Authentic Ugandan groundnut stew, freshly prepared daily. Includes free chapati.",
       price: 18000,
       image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop",
       stock: 30,
       sales: 10,  // Added sales
       category: "Food", // Added category
       isActive: true,
     });

     const p16 = await ctx.db.insert("products", {
       storeId: store3Id,
       name: "Fresh Juice – Passion Fruit (500ml)",
       description: "100% natural passion fruit juice, no preservatives, chilled & ready to drink.",
       price: 5000,
       image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=400&fit=crop",
       stock: 80,
       sales: 45,  // Added sales
       category: "Beverages", // Added category
       isActive: true,
     });

     const p17 = await ctx.db.insert("products", {
       storeId: store3Id,
       name: "Mandazi Dozen",
       description: "Freshly fried mandazi (Ugandan doughnuts), lightly sweetened, perfect with chai.",
       price: 6000,
       image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
       stock: 50,
       sales: 35,
       category: "Food",
       isActive: true,
     });

     const p18 = await ctx.db.insert("products", {
       storeId: store3Id,
       name: "Catering Package – 20 Pax",
       description: "Full buffet for 20 people: matooke, rice, meat, stews, salads & drinks. Advance order.",
       price: 450000,
       image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
       stock: 5,
       sales: 8,
       category: "Services",
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
       createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000, // 12 days ago
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
       createdAt: Date.now() - 11 * 24 * 60 * 60 * 1000, // 11 days ago
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
       createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
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
       notes: "",
       createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
     });

     const o13Id = await ctx.db.insert("orders", {
       storeId: store1Id,
       orderNumber: "SS-00105",
       customerName: "Esther Kigozi",
       customerPhone: "+256711700005",
       items: [
         { productId: p19.toString(), productName: "African Print Headwrap", price: 25000, quantity: 2, total: 50000 },
         { productId: p20.toString(), productName: "Handmade Bracelet Set", price: 15000, quantity: 3, total: 45000 },
       ],
       subtotal: 95000,
       total: 95000,
       status: "paid",
       createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
     });

     const o14Id = await ctx.db.insert("orders", {
       storeId: store1Id,
       orderNumber: "SS-00106",
       customerName: "Florence Nabukenya",
       customerPhone: "+256752800006",
       items: [{ productId: p21.toString(), productName: "Kikoy Sarong Wrap", price: 35000, quantity: 1, total: 35000 }],
       subtotal: 35000,
       total: 35000,
       status: "pending",
       createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
     });

     const o15Id = await ctx.db.insert("orders", {
       storeId: store1Id,
       orderNumber: "SS-00107",
       customerName: "Rehema Namutebi",
       customerPhone: "+256703900007",
       items: [
         { productId: p22.toString(), productName: "Beaded Choker Necklace", price: 28000, quantity: 2, total: 56000 },
         { productId: p1.toString(), productName: "Ankara Print Wrap Dress", price: 85000, quantity: 1, total: 85000 },
       ],
       subtotal: 141000,
       total: 141000,
       status: "paid",
       createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
     });

     const o16Id = await ctx.db.insert("orders", {
       storeId: store1Id,
       orderNumber: "SS-00108",
       customerName: "Samuel Obbo",
       customerPhone: "+256776000008",
       items: [{ productId: p23.toString(), productName: "Woven Tote Bag", price: 95000, quantity: 1, total: 95000 }],
       subtotal: 95000,
       total: 95000,
       status: "pending",
       createdAt: Date.now() - 6 * 60 * 60 * 1000,
     });

     const o17Id = await ctx.db.insert("orders", {
       storeId: store1Id,
       orderNumber: "SS-00109",
       customerName: "Jovia Nalwoga",
       customerPhone: "+256704100009",
       items: [{ productId: p24.toString(), productName: "Cashmere Blend Scarf", price: 65000, quantity: 2, total: 130000 }],
       subtotal: 130000,
       total: 130000,
       status: "failed",
       notes: "Payment timed out",
       createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
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
       createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
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
       createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
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
       createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
     });

     const o8Id = await ctx.db.insert("orders", {
       storeId: store2Id,
       orderNumber: "SS-00203",
       customerName: "Olive Kirabo",
       customerPhone: "+256703300003",
       items: [{ productId: p11.toString(), productName: "USB-C Fast Charger (65W)", price: 85000, quantity: 2, total: 170000 }],
       subtotal: 170000,
       total: 170000,
       status: "paid",
       createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
     });

     const o18Id = await ctx.db.insert("orders", {
       storeId: store2Id,
       orderNumber: "SS-00204",
       customerName: "Patrick Byaruhanga",
       customerPhone: "+256752400004",
       items: [
         { productId: p8.toString(), productName: "Wireless Earbuds Pro", price: 95000, quantity: 1, total: 95000 },
         { productId: p12.toString(), productName: "Bluetooth Speaker", price: 150000, quantity: 1, total: 150000 },
       ],
       subtotal: 245000,
       total: 245000,
       status: "pending",
       createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
     });

     const o19Id = await ctx.db.insert("orders", {
       storeId: store2Id,
       orderNumber: "SS-00205",
       customerName: "Norah Kigongo",
       customerPhone: "+256704500005",
       items: [{ productId: p13.toString(), productName: "20000mAh Power Bank", price: 75000, quantity: 1, total: 75000 }],
       subtotal: 75000,
       total: 75000,
       status: "paid",
       createdAt: Date.now() - 6 * 60 * 60 * 1000,
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
       createdAt: Date.now() - 9 * 24 * 60 * 60 * 1000, // 9 days ago
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
       createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
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
       createdAt: Date.now() - 11 * 24 * 60 * 60 * 1000, // 11 days ago
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
       createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000, // 12 days ago
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

// ─── Seed Promotions ───────────────────────────────────────────────────
export const seedPromotions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const existing = await ctx.db.query("promotions").first();
    if (existing) {
      return { message: "Promotions already seeded" };
    }

    const promotions = [
      {
        name: "Refer & Earn Pro",
        description: "Refer 3 sellers and earn 1 month of Pro plan free!",
        type: "referral" as const,
        rewardType: "free_month" as const,
        rewardValue: 1,
        triggerCondition: {
          type: "referral_count" as const,
          threshold: 3,
          period: "total" as const,
        },
        isActive: true,
        maxRedemptions: undefined,
        currentRedemptions: 0,
        startDate: now,
        endDate: undefined,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Performance Bonus",
        description: "Process UGX 2,000,000+ monthly and get 10% discount on next subscription",
        type: "performance" as const,
        rewardType: "discount_percentage" as const,
        rewardValue: 10,
        triggerCondition: {
          type: "transaction_volume" as const,
          threshold: 2000000,
          period: "monthly" as const,
        },
        isActive: true,
        maxRedemptions: undefined,
        currentRedemptions: 0,
        startDate: now,
        endDate: undefined,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Loyalty Reward",
        description: "Stay subscribed for 6+ months and earn exclusive rewards",
        type: "loyalty" as const,
        rewardType: "discount_percentage" as const,
        rewardValue: 15,
        triggerCondition: {
          type: "subscription_months" as const,
          threshold: 6,
          period: "total" as const,
        },
        isActive: true,
        maxRedemptions: undefined,
        currentRedemptions: 0,
        startDate: now,
        endDate: undefined,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const promo of promotions) {
      await ctx.db.insert("promotions", promo);
    }

    return {
      success: true,
      message: "Promotions seeded successfully",
      count: promotions.length,
    };
  },
});

// ─── Subscription Plans Seed ──────────────────────────────────────
export const seedPlans = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing plans first
    const existingPlans = await ctx.db.query("subscription_plans").collect();
    for (const plan of existingPlans) {
      await ctx.db.delete(plan._id);
    }

    const plans = [
      {
        name: "FREE",
        description: "Start Selling Instantly",
        price: 0,
        currency: "UGX",
        interval: "monthly" as const,
        features: ["10 products", "WhatsApp store link", "Mobile money payments", "Basic dashboard", "Customer list"],
        productLimit: 10,
        transactionFee: 4,
        isPopular: false,
        isActive: true,
      },
      {
        name: "PRO",
        description: "Grow Faster & Look Professional",
        price: 15000,
        currency: "UGX",
        interval: "monthly" as const,
        features: ["25 products", "Custom store link", "Auto payment confirmation", "Sales analytics", "Remove branding"],
        productLimit: 25,
        transactionFee: 2.5,
        isPopular: true,
        isActive: true,
      },
      {
        name: "BUSINESS",
        description: "Operate Like a Real Business",
        price: 35000,
        currency: "UGX",
        interval: "monthly" as const,
        features: ["50+ products", "Inventory tracking", "Advanced analytics", "Coupons & discounts", "Custom branding"],
        productLimit: 50,
        transactionFee: 1.5,
        isPopular: false,
        isActive: true,
      },
      {
        name: "ENTERPRISE",
        description: "Scale Without Limits",
        price: 0,
        currency: "UGX",
        interval: "lifetime" as const,
        features: ["Unlimited products", "Multi-user accounts", "API access", "Dedicated support", "White-label options"],
        productLimit: -1,
        transactionFee: 1,
        isPopular: false,
        isActive: true,
      },
    ];

    for (const plan of plans) {
      await ctx.db.insert("subscription_plans", plan);
    }

    return { success: true, message: "Plans seeded successfully", count: plans.length };
  },
});
