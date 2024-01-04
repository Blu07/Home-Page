import cv2
import os

def sections(filename, section_num, target_w=None, target_h=None):
    filepath = os.path.join('static', 'images', filename)
    image = cv2.imread(filepath)
    h, w, _ = image.shape
    
    
    # Crop to what is shown on the web page
    w_h_target_ratio = target_w / target_h
    h_w_target_ratio = target_h / target_w
    
    if (w / h) > w_h_target_ratio:
        h_size, w_size = h, h * w_h_target_ratio

    elif (w / h) < w_h_target_ratio:
        h_size, w_size = w * h_w_target_ratio, w

    else:
        h_size, w_size = h, w
    
    cropped_image = image[int(h/2 - h_size/2):int(h/2 + h_size/2),
                           int(w/2 - w_size/2):int(w/2 + w_size/2)]
    

  
    # Row
    crop_height = 80
    row_image = cropped_image[h - crop_height:h, 0:w]
    
    cv2.imwrite("static/images/bar_image.jpg", row_image)
    return "bar_image.jpg"
    

if __name__ == '__main__':
    filename = sections("Night-Moon.jpg", 10, 50, 60)
    img = cv2.imread(os.path.join('static', 'images', filename))
    cv2.imshow("Image", img)

    cv2.waitKey()
    cv2.destroyAllWindows()