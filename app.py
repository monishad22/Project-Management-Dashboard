from flask import (
    Flask,
    jsonify,
    render_template,
    redirect,
    url_for
)

from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from extensions import db, cors, jwt


def create_app():

    app = Flask(__name__)

    app.config.from_object(
        Config
    )

    db.init_app(app)

    cors.init_app(
        app
    )

    jwt.init_app(
        app
    )

    from routes.auth_routes import auth_bp
    from routes.product_routes import product_bp

    app.register_blueprint(
        auth_bp
    )

    app.register_blueprint(
        product_bp
    )

    from models.user import User
    from models.product import Product

    with app.app_context():

        db.create_all()

        admin = User.query.filter_by(
            username="admin"
        ).first()

        if not admin:

            admin = User(

                username="admin",

                email="admin@stockpilot.com",

                role="admin"

            )

            admin.set_password(
                "Admin@123"
            )

            db.session.add(
                admin
            )

            db.session.commit()

    @app.route("/")
    def home():

        return render_template(
            "login.html"
        )

    @app.route("/dashboard")
    def dashboard():

        return render_template(
            "index.html"
        )

    @app.route("/api/health")
    def health_check():

        try:

            with db.engine.connect() as connection:

                connection.execute(
                    db.text("SELECT 1")
                )

            return jsonify({

                "success": True,

                "message":
                    "StockPilot API is running.",

                "database":
                    "SQLite",

                "status":
                    "healthy"

            }), 200

        except Exception as error:

            return jsonify({

                "success": False,

                "message":
                    "Database connection failed.",

                "error":
                    str(error)

            }), 500

    return app


app = create_app()


if __name__ == "__main__":

    app.run(
        debug=True,
        port=5001
    )