from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/history')
def history():
    return render_template('index.html')

@app.route('/friends')
def friends():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)