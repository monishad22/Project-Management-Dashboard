from app import app
from extensions import db
from models.product import Product


products = [
    {
        "name": "Wireless Headphones",
        "category": "Electronics",
        "price": 2499,
        "stock_quantity": 25,
        "description": "Bluetooth wireless headphones with noise cancellation."
    },
    {
        "name": "Mechanical Keyboard",
        "category": "Electronics",
        "price": 3499,
        "stock_quantity": 8,
        "description": "RGB mechanical keyboard suitable for gaming and productivity."
    },
    {
        "name": "Smart Watch Pro",
        "category": "Wearables",
        "price": 5999,
        "stock_quantity": 15,
        "description": "Smart watch with fitness tracking and notification support."
    },
    {
        "name": "Laptop Stand",
        "category": "Accessories",
        "price": 1299,
        "stock_quantity": 0,
        "description": "Adjustable aluminum laptop stand for comfortable working."
    },
    {
        "name": "USB-C Hub",
        "category": "Accessories",
        "price": 1799,
        "stock_quantity": 12,
        "description": "Multi-port USB-C hub with HDMI and USB connectivity."
    },
    {
        "name": "Ergonomic Office Chair",
        "category": "Furniture",
        "price": 8999,
        "stock_quantity": 6,
        "description": "Ergonomic chair with adjustable height and lumbar support."
    },
    {
        "name": "Portable SSD 1TB",
        "category": "Storage",
        "price": 7499,
        "stock_quantity": 18,
        "description": "High-speed portable 1TB SSD for data storage and backup."
    },
    {
        "name": "Webcam Full HD",
        "category": "Electronics",
        "price": 2299,
        "stock_quantity": 3,
        "description": "Full HD webcam suitable for online meetings and streaming."
    }
]


with app.app_context():

    # Clear existing products
    Product.query.delete()

    # Add sample products
    for product_data in products:

        product = Product(
            name=product_data["name"],
            category=product_data["category"],
            price=product_data["price"],
            stock_quantity=product_data["stock_quantity"],
            description=product_data["description"]
        )

        db.session.add(product)

    db.session.commit()

    print("======================================")
    print("StockPilot database seeded successfully")
    print("Products added:", Product.query.count())
    print("======================================")