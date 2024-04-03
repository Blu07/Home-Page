
async function changeTopBar(filename) {
    // Get DOM elements
    const top_image_element = document.getElementById("main-image");
    const top_bar_element = document.getElementById("top-bar");

    // Calculate values based on DOM elements
    const img_height = top_image_element.clientHeight;
    const bar_height = top_bar_element.clientHeight;
    const screen_width = top_image_element.clientWidth;
    const num = 10;

    // Use provided filename or extract from main image source
    filename = getFilename(filename);

    // Construct URL and parameters
    const fetch_url_start = "/load_bar_image";
    const params = new URLSearchParams({
        image_height: img_height,
        bar_height: bar_height,
        screen_width: screen_width,
        filename: filename,
        sections_num: num,
    });
    const fetch_url = `${fetch_url_start}?${params.toString()}`;

    // Fetch Linear Gradient data
    let gradientData;
    try {
        const response = await fetch(fetch_url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        data = await response.json();
        gradientData = data;
    } catch (error) {
        console.error(`Error fetching data for Linear Gradient: ${error}`);
    }

    // Process and generate Linear Gradient
    const step = parseInt(100 / (num + 1));
    const perc_arr = Array.from(
        { length: num },
        (_, index) => index * step + step
    );

    let gradient = `linear-gradient(90deg,`;
    Object.keys(gradientData).forEach((value, index) => {
        gradient += ` rgba(${gradientData[value]}) ${perc_arr[index]}%,`;
    });
    gradient = gradient.slice(0, -1) + ")";

    // Apply the generated gradient to the top bar element
    top_bar_element.style.backgroundImage = gradient;
}

async function changeColorScheme(filename, colorScheme) {
    const bg_secondary = document.getElementsByClassName("bg-secondary");
    const bg_primary = document.getElementsByClassName("bg-primary");
    const bg_accent = document.getElementsByClassName("bg-accent");

    const text_primary = document.getElementsByClassName("text-primary");
    const text_secondary = document.getElementsByClassName("text-secondary");
    const text_accent = document.getElementsByClassName("text-accent");

    const detail_primary = document.getElementsByClassName("detail-primary");
    const detail_secondary = document.getElementsByClassName("detail-secondary");
    const detail_accent = document.getElementsByClassName("detail-accent");

    const backgrounds = [bg_primary, bg_secondary, bg_accent];
    const texts = [text_primary, text_secondary, text_accent];
    const details = [detail_primary, detail_secondary, detail_accent];

    // Will be implemented later
    const color_mode = getColorMode();

    // Use provided filename or extract from main image source
    filename = getFilename(filename);

    // Get colorScheme if not provided (default behaviour)
    try {
        if (colorScheme === undefined) {
            const fetch_url = `/color_scheme/${filename}`;
            const response = await fetch(fetch_url);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            colorScheme = await response.json();
        }
    } catch (error) {
        console.error(`Error fetching color scheme: ${error}`);
    }

    // Assign colors
    const primary_color = colorScheme.primary_color;
    const secondary_color = colorScheme.secondary_color;
    const accent_color = colorScheme.accent_color;

    // Organize arrays into groups
    const styles = ["light", "dark", "accent"];
    const DOM_elements = [backgrounds, texts, details];
    const colors = [primary_color, secondary_color, accent_color];

    // Apply colors to all elements with their respective color
    DOM_elements.forEach((category, style_index) => {
        category.forEach((arr, arr_index) => {
            [...arr].forEach((element) => {
                element.style[styles[style_index]] = colors[arr_index];
            });
        });
    });
}

async function changeMainImage(old_filename) {
    const top_image_element = document.getElementById("main-image");

    // Use provided filename or extract from main image source
    old_filename = getFilename(old_filename);
    let new_filename;

    const fetch_url = `/main_image?current=${old_filename}`;
    try {
        const response = await fetch(fetch_url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        new_filename = data.new_image_filename;
    } catch (error) {
        console.error(`Error fetching filename of new Main Image: ${error}`);
    }

    top_image_element.src = `static/images/main_images/${new_filename}`;

    changeColorScheme(new_filename);
    changeTopBar(new_filename);
}

function getColorMode() {
    // Check if the user prefers a dark or light color scheme
    if (window.matchMedia) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            return "light";
        } else {
            return "light";
        }
    } else {
        return "light"; // Fallback for browsers that do not support matchMedia
    }
}

function getFilename(filename) {
    if (filename) {
        return filename;
    }

    const top_image_element = document.getElementById("main-image");
    const url = new URL(top_image_element.src);
    filename = url.pathname.split("/").pop();

    return filename;
}

function updateActiveLink() {
    const sections = document.querySelectorAll("section");
    const scrollPosition = document.querySelector("main").scrollTop;
    const offset = 300;

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
    const topBarEl = document.getElementById("top-bar")
    const mainEl = document.getElementById("main")

    // Add an 'active' class to the clicked link
    topBarEl.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {

            event.preventDefault()
            // Remove 'active' class from all links
            document.querySelectorAll("#top-bar a").forEach((link) => {
                link.classList.remove("active");
            });

            // Add 'active' class to the clicked link
            event.target.classList.add("active");

            // Get x-height to scroll to
            const targetArea = document.querySelector(event.target.hash)
            const targetOffsetX = offsetTopFromBody(targetArea)
            const topBarHeight = topBarEl.clientHeight
            
            // Scroll to target area
            mainEl.scroll({
                top: targetOffsetX - topBarHeight,
                left: 0,
                behavior: "smooth",
            })

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

function init() {
    // Sections of document coloured at top-bar buttons.
    addClickListener();
    addScrollListener();
    updateActiveLink();

    // Top-bar colour gradient
    changeTopBar();
    addResizeListener();

    changeColorScheme();

}

function offsetTopFromBody(element) {
    if (element.offsetParent != document.body) {
        return offsetTopFromBody(element.offsetParent)
    }
    return element.offsetTop
}


window.onload = init();
