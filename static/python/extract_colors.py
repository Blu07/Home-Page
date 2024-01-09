import cv2
import os
import numpy as np
from sklearn.cluster import KMeans
from pprint import pprint
from collections import Counter


def palette_KMeans(image, n_clt=10):
    clt = KMeans(n_clusters=n_clt, n_init=1)
    clt.fit(image.reshape(-1, 3))

    labels = clt.cluster_centers_
    palette = clt.cluster_centers_.astype(int)

    return labels, palette


def BGR2RGB(BGR: tuple):
    return (BGR[2], BGR[1], BGR[0])


def get_color_sections(row_image, w, section_num, pixel_ratio=1):
    """
    Get the most common color from each vertical section the image.
    """

    most_common_colors = {}

    section_width = int(np.floor(w * pixel_ratio / section_num))
    for i in range(section_num):
        section_image = row_image[:, section_width * i:section_width * (i + 1)]

        BGR = np.average(section_image, axis=(0, 1))
        RGB = (int(BGR[2]), int(BGR[1]), int(BGR[0]))

        most_common_colors.update({f"sec{i}": RGB})

    # print(most_common_colors)

    return most_common_colors


def sections(filename, section_num,  target_h=None, bar_height=None, target_w=None):
    filepath = os.path.join('static', 'images', 'main_images', filename)
    image = cv2.imread(filepath)
    h, w, _ = image.shape

    # Crop to what is shown on the web page
    w_h_ratio = w / h
    w_h_target_ratio = target_w / target_h
    h_w_target_ratio = target_h / target_w

    if w_h_ratio > w_h_target_ratio:
        # Original Image WIDER than the target
        pixel_ratio = h / target_h
        h_size, w_size = h, int(h * w_h_target_ratio)

    elif w_h_ratio < w_h_target_ratio:
        # Original Image TALLER than the target
        pixel_ratio = w / target_w
        h_size, w_size = int(w * h_w_target_ratio), w

    else:
        # Original Image WIDER than the target
        pixel_ratio = 1
        h_size, w_size = h, w

    cropped_image = image[int(h/2 - h_size/2):int(h/2 + h_size/2),
                          int(w/2 - w_size/2):int(w/2 + w_size/2)]
    h, w = h_size, w_size

    # Row
    bar_height = int(max(
        100, h) * pixel_ratio) if bar_height is None else int(bar_height * pixel_ratio)
    row_image = cropped_image[h - bar_height:h, 0:w]
    row_image = cv2.flip(row_image, 0)

    most_common_colors = get_color_sections(
        row_image, target_w, section_num, pixel_ratio)

    # cv2.imwrite("static/images/shown_image.jpg", cropped_image)
    cv2.imwrite("static/images/bar_image.jpg", row_image)

    return most_common_colors


def color_scheme(filename):
    filepath = os.path.join("static", "images", "main_images", filename)
    image = cv2.imread(filepath)
    image.resize(501, 501)

    k_cluster = KMeans(n_clusters=5, n_init=2)
    k_cluster.fit(image.reshape(-1, 3))
    labels = k_cluster.labels_
    centers = k_cluster.cluster_centers_.astype(int)

    n_pixels = len(labels)
    counter = Counter(labels)  # Count Pixels per Cluster

    # Sort the cluster numbers by percent
    perc = {}
    for i in counter:
        perc[i] = np.round(counter[i]/n_pixels, 2)
    perc = dict(sorted(perc.items(), key=lambda item: item[1], reverse=True))

    color_names = ["primary_color", "secondary_color", "accent_color"]
    
    # Create the color scheme
    clr_sch = {}
    for i, color_name in enumerate(color_names):
        cluster = centers[list(perc.items())[i][0]]
        B, G, R = cluster
        color_code = f"rgb({R}, {G}, {B})"
        
        clr_sch.update({color_name: color_code})

    
    # for v in primary_color_BGR:
    #     if v < 200:
    #         continue

    #     mode = "light"


    return clr_sch


if __name__ == '__main__':

    colors = main_color("Night-Moon.jpg")
    print(colors)
