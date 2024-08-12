from langchain_community.document_loaders import YoutubeLoader
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import os
import main3
import main4
import time

app = Flask(__name__)
CORS(app)





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
        import traceback
        error_details = traceback.format_exc()
        return jsonify({'error': str(e), 'details': error_details}), 500



@app.route('/perform_pdf_rag', methods=['POST'])
def pdf_link_endpoint():
    time.sleep(3)
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



if __name__ == '__main__':
    app.run(port=5000, debug=False)