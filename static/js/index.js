// Top Bar Background Image
window.onload = () => {
  let top_image_element = document.getElementById("main-image");
  let top_bar_element = document.getElementById("top-bar");
  
  let img_height = top_image_element.clientHeight;
  let bar_height = top_bar_element.clientHeight;
  let screen_width = top_image_element.clientWidth;

  let filename = "Night-Moon.jpg"

  let load_url = `/load_bar_image/?image_height=${img_height}&bar_height=${bar_height}&screen_width=${screen_width}&filename=${filename}`;

  // Fetch data from a URL
  fetch(load_url)
    .then((response) => response.json())
    .then((data) => {
      // Handle the data
      document.getElementById("test").innerHTML = data.image_data;
      top_bar_element.style.backgroundSize = "100% 100%"
      top_bar_element.style.backgroundImage =
        'url("static/images/bar_image.jpg")';
    })
    .catch((error) => {
      // Handle errors
      console.error("Error fetching data:", error);
    });
};

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
