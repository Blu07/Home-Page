from flask import Flask, render_template, url_for
import secrets

secret_key = secrets.token_hex(16)

app = Flask(__name__)
app.secret_key = secret_key


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/feedback')
def feedback():
    return render_template('feedback.html')


@app.route('/portfolio')
def portfolio():
    return render_template("/portfolio.html")


@app.route('/aboutme')
def about_me():
    return render_template("/aboutme.html")


# @app.route('/')
# def _():
#    return render_template("/.html")


if __name__ == '__main__':

    # Run the app
    app.run(debug=True)
