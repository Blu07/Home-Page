// Top Bar Background Image
window.onload = () => {
  updateTopBar();
};

async function updateTopBar() {
  let top_image_element = document.getElementById("main-image");
  let top_bar_element = document.getElementById("top-bar");
  

  var imageUrl = top_image_element.src;
  var url = new URL(imageUrl);
  var filename = url.pathname.split("/").pop();

  let img_height = top_image_element.clientHeight;
  let bar_height = top_bar_element.clientHeight;
  let screen_width = top_image_element.clientWidth;
  const num = 10;

  let load_url = `/load_bar_image/`;
  load_url += `?image_height=${img_height}`;
  load_url += `&bar_height=${bar_height}`;
  load_url += `&screen_width=${screen_width}`;
  load_url += `&filename=${filename}`;
  load_url += `&sections_num=${num}`;

  try {
    let response = await fetch(load_url);
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
    document.getElementById("test").innerHTML = perc_arr;
    
    updateColorScheme(filename);
    
    top_bar_element.style.backgroundImage = linear_gradient;


    }
    catch (error) {
    // Handle errors
    console.error("Error updating top bar:", error);
  }
}




async function updateColorScheme(filename) {
  let main_element = document.getElementById("main")
  let image_btn = document.getElementById("image-btn");
  
  if (filename == undefined) {
    
    var imageUrl = top_image_element.src;
    var url = new URL(imageUrl);
    var filename = url.pathname.split("/").pop();
  }

  let fetch_url = `/color_scheme?current=${filename}`

  try {
    let response = await fetch(fetch_url);
    let data = await response.json();
    
    let main_color = data.main_color;
    image_btn.style.backgroundColor = main_color;
    main_element.style.backgroundColor = main_color;
    
  } catch (error) {
    console.error("Error fetching color scheme:", error);
    throw error; // Re-throw the error to be caught by the calling function
  }

}


function changeMainImage() {
  let top_bar_element = document.getElementById("top-bar");
  let top_image_element = document.getElementById("main-image");

  let imageUrl = top_image_element.src;
  let url = new URL(imageUrl);
  let filename = url.pathname.split("/").pop();
  
  let fetch_url = `/main_image?current=${filename}`

  fetch(fetch_url)
    .then((response) => response.json())
    .then((data) => {
      // Handle the data
      new_image_filename = data.new_image_filename;

      top_image_element.src = `static/images/main_images/${new_image_filename}`;
      updateTopBar();
      top_bar_element.style.backgroundColor = "black";
    })
    .catch((error) => {
      // Handle errors
      console.error("Error fetching data:", error);
    });
}

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

// Get all section elements
const sections = document.querySelectorAll("section");

// Function to check which section is in view
function updateActiveLink() {
  let scrollPosition = document.querySelector("main").scrollTop;
  let offset = 300;
  console.log(scrollPosition);

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

// Add scroll event listener
window.addEventListener("wheel", () => {
  // Throttle the function to improve performance
  clearTimeout(window.scrollTimeout);
  window.scrollTimeout = setTimeout(updateActiveLink, 100);
});
// Call the function initially to set the initial active link
updateActiveLink();
