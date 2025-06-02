from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

# URL da ESP8266
ESP_URL = "http://192.168.0.122/wifi"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_wifi")
def get_wifi():
    try:
        response = requests.get(ESP_URL, timeout=5)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        print(f"Erro ao buscar dados da ESP8266: {e}")
        return jsonify([])

if __name__ == "__main__":
  app.run(debug=True, host='0.0.0.0')

