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
    height = int(request.args.get('height'))
    width = int(request.args.get('width'))
    
    
    image_filename = 'Night-Moon.jpg'
    bar_name = extract_colors.sections(image_filename, width, height, 10)
    print(bar_name)
    image_url = url_for('static', filename=bar_name)
    return {'image_url': image_url}



if __name__ == '__main__':

    # Run the app
    app.run(debug=True)
