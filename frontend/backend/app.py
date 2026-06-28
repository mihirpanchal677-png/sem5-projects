from flask import Flask, request, jsonify
from flask_cors import CORS
from osint_scrapers import check_username_osint

app = Flask(__name__)
# CORS ઓન કરવું જરૂરી છે, નહિતર પોર્ટ 5500 અને 5000 વચ્ચે કનેક્શન બ્લોક થઈ જશે
CORS(app) 

@app.route('/api/search', methods=['POST'])
def search_target():
    data = request.json
    search_query = data.get('query')
    search_type = data.get('type') # 'username'
    
    if not search_query:
        return jsonify({"error": "Username is required"}), 400
        
    if search_type == 'username':
        # OSINT સ્ક્રિપ્ટ રન કરો
        result_report = check_username_osint(search_query)
        return jsonify({"target": search_query, "results": result_report})
    else:
        return jsonify({"error": "Invalid search type"}), 400

if __name__ == '__main__':
    # આ સર્વરને પોર્ટ 5000 પર રન કરશે
    app.run(debug=True, host='0.0.0.0' , port=5000)