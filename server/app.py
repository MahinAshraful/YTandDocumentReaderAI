from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import os
import main3
import main4

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.environ.get('ALLOWED_ORIGIN', '*')}})

# Assuming your Flask app is in the 'server' folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
client_dist_folder = os.environ.get('CLIENT_DIST_FOLDER', 
                                    os.path.abspath(os.path.join(BASE_DIR, '..', 'client', 'dist')))

@app.route("/", defaults={'path': ''})
@app.route("/<path:path>")
def serve(path):
    print(f"Requested path: {path}")
    if path and path.startswith("assets/"):
        file_path = os.path.join(client_dist_folder, path)
        directory, file_name = os.path.split(file_path)
        print(f"Serving asset: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        if os.path.exists(file_path):
            return send_from_directory(directory, file_name)
    
    print(f"Serving index.html")
    return send_from_directory(client_dist_folder, 'index.html')

@app.route('/perform_pdf_rag', methods=['POST'])
def pdf_link_endpoint():
    data = request.json
    query = data.get('query')
    pdf_path = data.get('pdf_path')
    
    if not query or not pdf_path:
        return jsonify({'error': 'Missing query or pdf_path'}), 400
    
    try:
        result = main4.perform_pdf_rag(query, pdf_path)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/perform_yt_rag', methods=['POST'])
def rag_endpoint():
    data = request.json
    query = data.get('query')
    link = data.get('link')
    
    if not query or not link:
        return jsonify({'error': 'Missing query or link'}), 400
    
    try:
        result = main3.perform_yt_rag(query, link)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)