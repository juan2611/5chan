from flask import Flask, render_template

app = Flask(__name__,static_url_path='', static_folder="client", template_folder="client")

@app.route("/")
def hello():
    return render_template('index.html')

@app.errorhandler(404)
def handle_404(e):
    return render_template('index.html')

app.debug=False
app.run(host="localhost",port=3000)
