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
  let main_element = document.getElementById("main");
  let image_btn = document.getElementById("image-btn");
  let top_image_element = document.getElementById("main-image");

  var primary_color;
  var secondary_color;
  var accent_color;

  if (arg === undefined) {
    var imageUrl = top_image_element.src;
    var url = new URL(imageUrl);
    var filename = url.pathname.split("/").pop();
  } else if (isColorScheme) {
    primary_color = arg.primary_color;
    secondary_color = arg.secondary_color;
    accent_color = arg.accent_color;
  }

  if (isColorScheme === false || isColorScheme === undefined) {
    let fetch_url = `/color_scheme/${filename}`;

    try {
      let response = await fetch(fetch_url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let data = await response.json();

      primary_color = data.primary_color;
    } catch (error) {
      console.error("Error fetching color scheme:", error);
    }
  }
  image_btn.style.backgroundColor = primary_color;
  main_element.style.backgroundColor = primary_color;
}

async function changeMainImage() {
  let top_image_element = document.getElementById("main-image");

  let imageUrl = top_image_element.src;
  let url = new URL(imageUrl);
  let filename = url.pathname.split("/").pop();

  let fetch_url = `/main_image?current=${filename}`;
  try {
    const response = await fetch(fetch_url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    var new_image_filename = data.new_image_filename;
    var color_scheme = data.color_scheme;
    top_image_element.src = `static/images/main_images/${new_image_filename}`;

    changeTopBar(new_image_filename);
    changeColorScheme(color_scheme, true);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
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
