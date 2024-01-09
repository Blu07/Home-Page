function getColorMode() {
  // Check if the user prefers a dark or light color scheme
  if (window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      color_mode = "dark";
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      color_mode = "light";
    } else {
      color_mode = "light";
    }
  } else {
    color_mode = "light"; // Fallback for browsers that do not support matchMedia
  }
}

function applyColorsToElements(main_array, colors, styles) {
  main_array.forEach((category, style_index) => {
    category.forEach((arr, arr_index) => {
      [...arr].forEach((element) => {
        // console.log(element, styles[style_index], colors, arr_index)
        element.style[styles[style_index]] = colors[arr_index];
      });
    });
  });
}

async function fetchNewImage(filename) {
  let fetch_url = `/main_image?current=${filename}`;
  try {
    const response = await fetch(fetch_url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.new_image_filename;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchColorScheme(filename) {
  try {
    let fetch_url = `/color_scheme/${filename}`;
    let response = await fetch(fetch_url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching color scheme:", error);
    return null; // or throw the error depending on your error handling strategy
  }
}

async function changeTopBar(filename) {
  let top_image_element = document.getElementById("main-image");
  let top_bar_element = document.getElementById("top-bar");

  if (!filename) {
    var imageUrl = top_image_element.src;
    var url = new URL(imageUrl);
    var filename = url.pathname.split("/").pop();
  }

  let img_height = top_image_element.clientHeight;
  let bar_height = top_bar_element.clientHeight;
  let screen_width = top_image_element.clientWidth;
  const num = 10;

  let load_url = "/load_bar_image";
  let params = new URLSearchParams({
    image_height: img_height,
    bar_height: bar_height,
    screen_width: screen_width,
    filename: filename,
    sections_num: num,
  });

  load_url += `?${params.toString()}`;

  // console.log(filename, load_url);

  try {
    let response = await fetch(load_url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await response.json();

    const step = parseInt(100 / (num + 1));
    let perc_arr = Array.from(
      { length: num },
      (_, index) => index * step + step
    );

    // Generate linear-gradient string for the css.
    let linear_gradient = `linear-gradient(90deg,`;
    Object.keys(data).forEach((value, index) => {
      linear_gradient += ` rgba(${data[value]}) ${perc_arr[index]}%,`;
    });
    linear_gradient = linear_gradient.slice(0, -1) + ")";

    top_bar_element.style.backgroundImage = linear_gradient;
  } catch (error) {
    // Handle errors
    console.error("Error updating top bar:", error);
  }
}

async function changeColorScheme(arg, isColorScheme) {
  let bg_primary = document.getElementsByClassName("bg-primary");
  let bg_secondary = document.getElementsByClassName("bg-secondary");
  let bg_accent = document.getElementsByClassName("bg-accent");

  let text_primary = document.getElementsByClassName("text-primary");
  let text_secondary = document.getElementsByClassName("text-secondary");
  let text_accent = document.getElementsByClassName("text-accent");

  let detail_primary = document.getElementsByClassName("detail-primary");
  let detail_secondary = document.getElementsByClassName("detail-secondary");
  let detail_accent = document.getElementsByClassName("detail-accent");

  let backgrounds = [bg_primary, bg_secondary, bg_accent];
  let texts = [text_primary, text_secondary, text_accent];
  let details = [detail_primary, detail_secondary, detail_accent];

  var primary_color;
  var secondary_color;
  var accent_color;

  // There is no input, get filename of current displayed image
  if (arg === undefined) {
    let top_image_element = document.getElementById("main-image");
    let imageUrl = top_image_element.src;
    let url = new URL(imageUrl);
    var filename = url.pathname.split("/").pop();
  }
  // There is input, do this if input is a Color Scheme
  else if (isColorScheme) {
    primary_color = arg.primary_color;
    secondary_color = arg.secondary_color;
    accent_color = arg.accent_color;
  }

  // There is input, but it is not a Color Scheme
  if (!isColorScheme || isColorScheme === undefined) {
    let color_scheme = await fetchColorScheme(filename);
    primary_color = color_scheme.primary_color;
    secondary_color = color_scheme.secondary_color;
    accent_color = color_scheme.accent_color;
  }

  let styles_properties = ["backgroundColor", "color", "borderColor"];
  let all_elements = [backgrounds, texts, details];
  let colors = [primary_color, secondary_color, accent_color];

  // Change the colors of all elements to their respectives
  applyColorsToElements(all_elements, colors, styles_properties);
}


async function changeMainImage() {
  let top_image_element = document.getElementById("main-image");

  let imageUrl = top_image_element.src;
  let url = new URL(imageUrl);
  let filename = url.pathname.split("/").pop();

  let new_filename = await fetchNewImage(filename);
  top_image_element.src = `static/images/main_images/${new_filename}`;

  changeTopBar(new_filename);
  changeColorScheme();
}

function updateActiveLink() {
  const sections = document.querySelectorAll("section");
  let scrollPosition = document.querySelector("main").scrollTop;
  let offset = 300;

  // If at the top, deactivate all links
  if (scrollPosition <= window.innerHeight - offset) {
    document.querySelectorAll("#top-bar a").forEach((link) => {
      link.classList.remove("active");
    });
    return;
  }

  sections.forEach((section, index) => {
    const top = section.offsetTop - offset;
    const bottom = top + section.offsetHeight;

    if (scrollPosition >= top && scrollPosition < bottom) {
      // Remove 'active' class from all links
      document.querySelectorAll("#top-bar a").forEach((link) => {
        link.classList.remove("active");
      });

      // Add 'active' class to the corresponding link
      document.querySelectorAll("#top-bar a")[index].classList.add("active");
    }
  });
}

function addClickListener() {
  // Add an 'active' class to the clicked link
  document.getElementById("top-bar").addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      // Remove 'active' class from all links
      document.querySelectorAll("#top-bar a").forEach((link) => {
        link.classList.remove("active");
      });

      // Add 'active' class to the clicked link
      event.target.classList.add("active");
    }
  });
}

function addScrollListener() {
  window.addEventListener("wheel", () => {
    // Throttle the function to improve performance
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(updateActiveLink, 100);
  });
}

function addResizeListener() {
  window.addEventListener("resize", () => {
    // Throttle the function to improve performance
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(changeTopBar, 200);
  });
}

var color_mode;
window.onload = () => {
  color_mode = getColorMode();

  // Sections of document coloured at top-bar buttons.
  addClickListener();
  addScrollListener();
  updateActiveLink(); // Call the function initially to set the initial active link

  // Top-bar colour gradient
  changeTopBar();
  addResizeListener();
};
