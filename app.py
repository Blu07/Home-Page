from flask import Flask, render_template, request, url_for
import secrets


from static.python import extract_colors
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


@app.route('/load_bar_image/')
def load_bar_image():
    image_height = int(request.args.get('image_height'))
    bar_height = int(request.args.get('bar_height'))
    width = int(request.args.get('screen_width'))
    image_filename = str(request.args.get('filename'))
    
    colors = extract_colors.sections(image_filename, 10, image_height, bar_height, width)

    return colors


if __name__ == '__main__':

    # Run the app
    app.run(debug=True)
