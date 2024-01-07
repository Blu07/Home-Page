from flask import Flask, render_template, request, url_for
import secrets
import os
import random

from static.python import extract_colors
secret_key = secrets.token_hex(16)

app = Flask(__name__)
app.secret_key = secret_key


@app.route('/')
def index():
    main_image_filename = main_image()
    clr_schm = color_scheme(main_image_filename)
    primary_color = clr_schm["primary_color"]
    main_image_url = url_for('static', filename=f'images/main_images/{main_image_filename}')

    return render_template('index.html', main_image_url=main_image_url, primary_color=primary_color)


@app.route('/feedback')
def feedback():
    return render_template('feedback.html')


@app.route('/portfolio')
def portfolio():
    return render_template("/portfolio.html")


@app.route('/aboutme')
def about_me():
    return render_template("/aboutme.html")


@app.route("/color_scheme/<string:filename>")
def color_scheme(filename):
    if not filename:
        filename = request.args.get("current")
    clr_schm = extract_colors.main_color(filename)
    return clr_schm


@app.route('/main_image')
def main_image():
    args = request.args
    excluded_img = args.get('current')
    
    
    for _, _, filenames in os.walk(f'static/images/main_images'):
        
        if not excluded_img:
            return random.choice(filenames)
        
        filenames.remove(excluded_img)
        new_image_filename = random.choice(filenames)

        clr_sch = extract_colors.main_color(new_image_filename)

        return {'new_image_filename': new_image_filename, 'color_scheme': clr_sch}


@app.route('/load_bar_image')
def load_bar_image():
    args = request.args
    image_height = int(args.get('image_height'))
    bar_height = int(args.get('bar_height'))
    width = int(args.get('screen_width'))
    image_filename = str(args.get('filename'))
    sections_num = int(args.get('sections_num'))
    
    colors = extract_colors.sections(image_filename, sections_num, image_height, bar_height, width)
    

    return colors


if __name__ == '__main__':

    # Run the app
    app.run(debug=True)
