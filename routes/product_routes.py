import csv
import io

from flask import (
    Blueprint,
    request,
    jsonify,
    Response
)

from flask_jwt_extended import jwt_required

from sqlalchemy import or_, func

from extensions import db
from models.product import Product


product_bp = Blueprint(
    "products",
    __name__,
    url_prefix="/api/products"
)


# ============================================================
# VALIDATION
# ============================================================

def validate_product_data(
    data,
    existing_product=None
):

    if not isinstance(data, dict):

        return "Invalid request data."

    name = data.get("name")
    category = data.get("category")
    price = data.get("price")
    stock_quantity = data.get("stock_quantity")
    description = data.get(
        "description",
        ""
    )

    if not name or not str(name).strip():

        return "Product name is required."

    name = str(name).strip()

    if len(name) < 2:

        return (
            "Product name must contain "
            "at least 2 characters."
        )

    if len(name) > 100:

        return (
            "Product name cannot exceed "
            "100 characters."
        )

    if not category or not str(category).strip():

        return "Category is required."

    category = str(category).strip()

    if len(category) > 50:

        return (
            "Category cannot exceed "
            "50 characters."
        )

    if price is None or price == "":

        return "Price is required."

    try:

        price_value = float(price)

    except (
        ValueError,
        TypeError
    ):

        return "Price must be a valid number."

    if price_value <= 0:

        return "Price must be greater than 0."

    if stock_quantity is None or stock_quantity == "":

        return "Stock quantity is required."

    try:

        stock_value = int(
            stock_quantity
        )

    except (
        ValueError,
        TypeError
    ):

        return (
            "Stock quantity must be "
            "a whole number."
        )

    if stock_value < 0:

        return (
            "Stock quantity cannot "
            "be negative."
        )

    description = str(
        description or ""
    ).strip()

    if len(description) > 1000:

        return (
            "Description cannot exceed "
            "1000 characters."
        )

    existing_query = Product.query.filter(
        func.lower(Product.name)
        == name.lower()
    )

    if existing_product:

        existing_query = existing_query.filter(
            Product.id != existing_product.id
        )

    duplicate = existing_query.first()

    if duplicate:

        return (
            f"A product named '{name}' "
            "already exists."
        )

    return None


# ============================================================
# GET PRODUCTS
# ============================================================

@product_bp.route("", methods=["GET"])
@jwt_required()
def get_products():

    try:

        search = request.args.get(
            "search",
            ""
        ).strip()

        category = request.args.get(
            "category",
            ""
        ).strip()

        sort = request.args.get(
            "sort",
            ""
        ).strip()

        page = request.args.get(
            "page",
            1,
            type=int
        )

        per_page = request.args.get(
            "per_page",
            8,
            type=int
        )

        if page < 1:
            page = 1

        if per_page < 1:
            per_page = 8

        if per_page > 50:
            per_page = 50

        query = Product.query

        if search:

            pattern = f"%{search}%"

            query = query.filter(
                or_(
                    Product.name.ilike(pattern),
                    Product.category.ilike(pattern),
                    Product.description.ilike(pattern)
                )
            )

        if (
            category and
            category.lower() != "all"
        ):

            query = query.filter(
                Product.category == category
            )

        if sort == "price_asc":

            query = query.order_by(
                Product.price.asc()
            )

        elif sort == "price_desc":

            query = query.order_by(
                Product.price.desc()
            )

        elif sort == "name_asc":

            query = query.order_by(
                Product.name.asc()
            )

        elif sort == "name_desc":

            query = query.order_by(
                Product.name.desc()
            )

        elif sort == "stock_asc":

            query = query.order_by(
                Product.stock_quantity.asc()
            )

        elif sort == "stock_desc":

            query = query.order_by(
                Product.stock_quantity.desc()
            )

        else:

            query = query.order_by(
                Product.created_at.desc()
            )

        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        products = pagination.items

        return jsonify({

            "success": True,

            "data": [
                product.to_dict()
                for product in products
            ],

            "pagination": {

                "page": pagination.page,

                "per_page": pagination.per_page,

                "total": pagination.total,

                "pages": pagination.pages,

                "has_next": pagination.has_next,

                "has_previous":
                    pagination.has_prev

            }

        }), 200

    except Exception as error:

        return jsonify({

            "success": False,

            "message":
                "Failed to retrieve products.",

            "error": str(error)

        }), 500


# ============================================================
# GET SINGLE PRODUCT
# ============================================================

@product_bp.route(
    "/<int:product_id>",
    methods=["GET"]
)
@jwt_required()
def get_product(product_id):

    try:

        product = Product.query.get(
            product_id
        )

        if not product:

            return jsonify({

                "success": False,

                "message":
                    "Product not found."

            }), 404

        return jsonify({

            "success": True,

            "data":
                product.to_dict()

        }), 200

    except Exception as error:

        return jsonify({

            "success": False,

            "message":
                "Failed to retrieve product.",

            "error": str(error)

        }), 500


# ============================================================
# CREATE PRODUCT
# ============================================================

@product_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
def create_product():

    try:

        data = request.get_json(
            silent=True
        )

        if not data:

            return jsonify({

                "success": False,

                "message":
                    "Request body is required."

            }), 400

        validation_error =validate_product_data(data)

        if validation_error:

            return jsonify({

                "success": False,

                "message":
                    validation_error

            }), 400

        product = Product(

            name=str(
                data.get("name")
            ).strip(),

            category=str(
                data.get("category")
            ).strip(),

            price=float(
                data.get("price")
            ),

            stock_quantity=int(
                data.get("stock_quantity")
            ),

            description=str(
                data.get(
                    "description",
                    ""
                )
            ).strip()

        )

        db.session.add(product)

        db.session.commit()

        return jsonify({

            "success": True,

            "message":
                "Product created successfully.",

            "data":
                product.to_dict()

        }), 201

    except Exception as error:

        db.session.rollback()

        return jsonify({

            "success": False,

            "message":
                "Failed to create product.",

            "error": str(error)

        }), 500


# ============================================================
# UPDATE PRODUCT
# ============================================================

@product_bp.route(
    "/<int:product_id>",
    methods=["PUT"]
)
@jwt_required()
def update_product(product_id):

    try:

        product = Product.query.get(
            product_id
        )

        if not product:

            return jsonify({

                "success": False,

                "message":
                    "Product not found."

            }), 404

        data = request.get_json(
            silent=True
        )

        if not data:

            return jsonify({

                "success": False,

                "message":
                    "Request body is required."

            }), 400

        validation_error = (
            validate_product_data(
                data,
                existing_product=product
            )
        )

        if validation_error:

            return jsonify({

                "success": False,

                "message":
                    validation_error

            }), 400

        product.name = str(
            data.get("name")
        ).strip()

        product.category = str(
            data.get("category")
        ).strip()

        product.price = float(
            data.get("price")
        )

        product.stock_quantity = int(
            data.get("stock_quantity")
        )

        product.description = str(
            data.get(
                "description",
                ""
            )
        ).strip()

        db.session.commit()

        return jsonify({

            "success": True,

            "message":
                "Product updated successfully.",

            "data":
                product.to_dict()

        }), 200

    except Exception as error:

        db.session.rollback()

        return jsonify({

            "success": False,

            "message":
                "Failed to update product.",

            "error": str(error)

        }), 500


# ============================================================
# DELETE PRODUCT
# ============================================================

@product_bp.route(
    "/<int:product_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_product(product_id):

    try:

        product = Product.query.get(
            product_id
        )

        if not product:

            return jsonify({

                "success": False,

                "message":
                    "Product not found."

            }), 404

        db.session.delete(product)

        db.session.commit()

        return jsonify({

            "success": True,

            "message":
                "Product deleted successfully."

        }), 200

    except Exception as error:

        db.session.rollback()

        return jsonify({

            "success": False,

            "message":
                "Failed to delete product.",

            "error": str(error)

        }), 500


# ============================================================
# STATISTICS
# ============================================================

@product_bp.route(
    "/stats/summary",
    methods=["GET"]
)
@jwt_required()
def product_statistics():

    try:

        total_products = Product.query.count()

        in_stock = Product.query.filter(
            Product.stock_quantity > 10
        ).count()

        low_stock = Product.query.filter(
            Product.stock_quantity.between(
                1,
                10
            )
        ).count()

        out_of_stock = Product.query.filter(
            Product.stock_quantity == 0
        ).count()

        total_stock_units = (
            db.session.query(
                func.coalesce(
                    func.sum(
                        Product.stock_quantity
                    ),
                    0
                )
            ).scalar()
        )

        total_inventory_value = (
            db.session.query(
                func.coalesce(
                    func.sum(
                        Product.price *
                        Product.stock_quantity
                    ),
                    0
                )
            ).scalar()
        )

        if total_products > 0:

            inventory_health = round(
                (
                    in_stock /
                    total_products
                ) * 100
            )

        else:

            inventory_health = 0

        return jsonify({

            "success": True,

            "data": {

                "total_products":
                    total_products,

                "in_stock":
                    in_stock,

                "low_stock":
                    low_stock,

                "out_of_stock":
                    out_of_stock,

                "total_stock_units":
                    int(total_stock_units),

                "total_inventory_value":
                    round(
                        float(
                            total_inventory_value
                        ),
                        2
                    ),

                "inventory_health":
                    inventory_health

            }

        }), 200

    except Exception as error:

        return jsonify({

            "success": False,

            "message":
                "Failed to retrieve statistics.",

            "error": str(error)

        }), 500


# ============================================================
# ATTENTION PRODUCTS
# ============================================================

@product_bp.route(
    "/attention",
    methods=["GET"]
)
@jwt_required()
def attention_products():

    try:

        products = Product.query.filter(
            Product.stock_quantity <= 10
        ).order_by(
            Product.stock_quantity.asc()
        ).all()

        return jsonify({

            "success": True,

            "count":
                len(products),

            "data": [
                product.to_dict()
                for product in products
            ]

        }), 200

    except Exception as error:

        return jsonify({

            "success": False,

            "message":
                "Failed to retrieve alerts.",

            "error": str(error)

        }), 500


# ============================================================
# CATEGORY ANALYTICS
# ============================================================

@product_bp.route(
    "/stats/categories",
    methods=["GET"]
)
@jwt_required()
def category_statistics():

    try:

        rows = db.session.query(
            Product.category,
            func.count(Product.id),
            func.sum(
                Product.stock_quantity
            )
        ).group_by(
            Product.category
        ).order_by(
            func.count(Product.id).desc()
        ).all()

        data = []

        for category, count, stock in rows:

            data.append({

                "category":
                    category,

                "product_count":
                    count,

                "stock_units":
                    int(stock or 0)

            })

        return jsonify({

            "success": True,

            "data": data

        }), 200

    except Exception as error:

        return jsonify({

            "success": False,

            "message":
                "Failed to load category analytics.",

            "error": str(error)

        }), 500


# ============================================================
# CSV EXPORT
# ============================================================

@product_bp.route(
    "/export/csv",
    methods=["GET"]
)
@jwt_required()
def export_csv():

    products = Product.query.order_by(
        Product.id.asc()
    ).all()

    output = io.StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow([
        "ID",
        "Name",
        "Category",
        "Price",
        "Stock Quantity",
        "Stock Status",
        "Description"
    ])

    for product in products:

        writer.writerow([

            product.id,

            product.name,

            product.category,

            product.price,

            product.stock_quantity,

            product.get_stock_status(),

            product.description or ""

        ])

    response = Response(
        output.getvalue(),
        mimetype="text/csv"
    )

    response.headers[
        "Content-Disposition"
    ] = (
        "attachment; filename=stockpilot_products.csv"
    )

    return response