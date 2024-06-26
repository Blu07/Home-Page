from flask import Flask, render_template, request, url_for, jsonify, send_from_directory
import json
import secrets
import os
import random

from static.python import extract_colors
secret_key = secrets.token_hex(16)

app = Flask(__name__)
app.secret_key = secret_key


projects = [
    "analysis",
    "grocery",
    "shop",
    "cookies",
    "formlerFigurer",
    "timeplan",
    "digitalNorway"
]




@app.route('/')
def index():
    html_files = projects + ["index"] 
    print(html_files)
    for file in html_files:
        file_html = f'{file}.html'
        content = render_template(file_html)

    
        with open(f'html/{file_html}', 'w+') as f:
            f.write(content)
            print(f"Rendered {file}")
        

    
    # main_image_filename = main_image()
    # clr_schm = color_scheme(main_image_filename)
    
    # primary_color = clr_schm[0]
    # main_image_url = url_for('static', filename=f'images/main_images/{main_image_filename}')

    return render_template('index.html')


@app.route('/<path:project_name>')
def feedback(project_name):
    if not project_name in projects:
        return None

    return render_template(f'{project_name}.html')



# @app.route("/color_scheme/<string:filename>")
# def color_scheme(filename, mode="light"):
#     if not filename:
#         filename = request.args.get("current")
#     mode = request.args.get("color_mode")
#     clr_schm = extract_colors.color_scheme(filename, mode)
#     return clr_schm


# @app.route('/main_image')
# def main_image():
#     args = request.args
#     excluded_img = args.get('current')
    
#     for _, _, filenames in os.walk(f'static/images/main_images'):
#         if not excluded_img:
#             return random.choice(filenames)
        
#         filenames.remove(excluded_img)
#         new_image_filename = random.choice(filenames)

#         return {'new_image_filename': new_image_filename}


# @app.route('/load_bar_image')
# def load_bar_image():
#     args = request.args
#     image_height = int(args.get('image_height'))
#     bar_height = int(args.get('bar_height'))
#     width = int(args.get('screen_width'))
#     image_filename = str(args.get('filename'))
#     sections_num = int(args.get('sections_num'))
    
#     colors = extract_colors.sections(image_filename, sections_num, image_height, bar_height, width)
    

#     return colors


# @app.route('/analysisJSON')
# def anaylsisCSV():
    
#     with open('uploads/analysisNotion.json') as file:
#         return jsonify(json.load(file))


# @app.route('/database')
# def database():
#     return send_from_directory('static/js', 'analysis.js', mimetype='application/javascript')





if __name__ == '__main__':

    # Run the app
    app.run(debug=True)
