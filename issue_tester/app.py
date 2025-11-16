from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory data store for simplicity
data_store = {}

@app.route('/process', methods=['POST'])
def process_data():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input: No JSON data received"}), 400

    # Basic validation: Check for required fields
    required_fields = ['id', 'value']
    if not all(field in data for field in required_fields):
        missing_fields = [field for field in required_fields if field not in data]
        return jsonify({"error": f"Invalid data: Missing required fields - {', '.join(missing_fields)}"}), 400

    # Further validation: Ensure 'id' is an integer and 'value' is a string
    try:
        item_id = int(data['id'])
        item_value = str(data['value'])
    except ValueError:
        return jsonify({"error": "Invalid data: 'id' must be an integer and 'value' must be a string"}), 400

    # Simulate processing
    data_store[item_id] = item_value

    # Simulate potential errors during processing (e.g., unexpected data format)
    # This is a placeholder for where more complex validation or processing might occur
    # For this fix, we are ensuring basic structure and types are valid
    try:
        # Placeholder for more complex logic that might fail
        # If 'value' is 'error', simulate a processing error
        if item_value == 'error':
            raise ValueError("Simulated processing error due to 'error' value")
        pass # All good, data processed
    except Exception as e:
        # Log the detailed error for debugging
        app.logger.error(f"Processing error for ID {item_id}: {e}", exc_info=True)
        # Return a more specific error to the client if possible, or a generic one
        return jsonify({"error": "An internal error occurred during data processing"}), 500

    return jsonify({"message": f"Data processed successfully for ID: {item_id}"}), 200

@app.route('/data', methods=['GET'])
def get_data():
    return jsonify(data_store), 200

if __name__ == '__main__':
    # Enable logging for Flask application
    import logging
    logging.basicConfig(level=logging.INFO)
    app.run(host='0.0.0.0', port=5000)
