// MongoDB seed script for products
db = db.getSiblingDB('products');

// Clear existing products
db.products.deleteMany({});

// Sample products
const products = [
    {
        name: "Wireless Bluetooth Headphones",
        description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
        category: "Electronics",
        price: 79.99,
        stock: 150,
        sku: "WBH-001",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
        tags: ["electronics", "audio", "wireless"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Smart Watch Series 5",
        description: "Advanced fitness tracking with heart rate monitor and GPS",
        category: "Electronics",
        price: 299.99,
        stock: 85,
        sku: "SW-005",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
        tags: ["electronics", "wearable", "fitness"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Laptop Backpack",
        description: "Water-resistant backpack with padded laptop compartment up to 15.6 inches",
        category: "Accessories",
        price: 49.99,
        stock: 200,
        sku: "LBP-003",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"],
        tags: ["accessories", "bag", "laptop"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Mechanical Gaming Keyboard",
        description: "RGB backlit mechanical keyboard with blue switches",
        category: "Electronics",
        price: 89.99,
        stock: 120,
        sku: "MGK-007",
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
        images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"],
        tags: ["electronics", "gaming", "keyboard"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with adjustable DPI",
        category: "Electronics",
        price: 29.99,
        stock: 300,
        sku: "WM-002",
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"],
        tags: ["electronics", "mouse", "wireless"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "USB-C Hub Adapter",
        description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
        category: "Accessories",
        price: 39.99,
        stock: 175,
        sku: "UCH-004",
        imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
        images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500"],
        tags: ["accessories", "usb", "adapter"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Portable SSD 1TB",
        description: "High-speed portable solid state drive with USB 3.2",
        category: "Electronics",
        price: 129.99,
        stock: 95,
        sku: "SSD-1TB",
        imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500",
        images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500"],
        tags: ["electronics", "storage", "ssd"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Webcam HD 1080p",
        description: "Full HD webcam with built-in microphone for video calls",
        category: "Electronics",
        price: 59.99,
        stock: 140,
        sku: "WC-1080",
        imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500",
        images: ["https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500"],
        tags: ["electronics", "webcam", "video"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Phone Stand Holder",
        description: "Adjustable aluminum phone stand for desk",
        category: "Accessories",
        price: 19.99,
        stock: 250,
        sku: "PSH-006",
        imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
        images: ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500"],
        tags: ["accessories", "phone", "stand"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Wireless Charger Pad",
        description: "Fast wireless charging pad compatible with Qi-enabled devices",
        category: "Electronics",
        price: 24.99,
        stock: 180,
        sku: "WCP-008",
        imageUrl: "https://images.unsplash.com/photo-1591290619762-c588f0e8e0b4?w=500",
        images: ["https://images.unsplash.com/photo-1591290619762-c588f0e8e0b4?w=500"],
        tags: ["electronics", "charger", "wireless"],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Insert products
db.products.insertMany(products);

print("Inserted " + products.length + " products successfully!");
