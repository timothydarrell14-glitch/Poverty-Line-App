from flask import Blueprint, request, jsonify

# Create a dedicated Flask Blueprint for callback-related endpoints
callback_bp = Blueprint("callbacks", __name__, url_prefix="/api")


@callback_bp.route("/callbacks", methods=["POST"])
def handle_callback_request():
    data = request.get_json() or {}

    # Extract form fields sent by the React frontend
    name = data.get("name", "Anonymous")
    phone = data.get("phone")
    topic = data.get("topic", "General Inquiry")
    time_slot = data.get("timeSlot", "Within 15 minutes")

    # Phone is a mandatory field
    if not phone:
        return jsonify(
            {"error": "Bad Request", "message": "Phone number is required."}
        ), 400

    # Option A: Notification & Alert Logging (No DB migration required)
    print("\n" + "=" * 55)
    print("🚨 [URGENT SUPPORT ALERT] New Callback Request Logged")
    print(f"👤 Preferred Name : {name}")
    print(f"📞 Contact Number : {phone}")
    print(f"📋 Primary Topic  : {topic}")
    print(f"⏰ Preferred Time : {time_slot}")
    print("=" * 55 + "\n")

    return jsonify(
        {
            "success": True,
            "message": "Confidential callback request logged successfully.",
            "data": {
                "name": name,
                "phone": phone,
                "topic": topic,
                "timeSlot": time_slot,
            },
        }
    ), 200
