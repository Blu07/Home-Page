google.charts.load("current", { packages: ["table"] });
google.charts.setOnLoadCallback(plotData);

async function plotData() {
  const container = document.querySelector("#content");

  try {
    const response = await fetch("analysisJSON");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await response.json();

    const table = new google.visualization.Table(container);
    table.draw(google.visualization.arrayToDataTable(data, true));

  } catch (error) {
    console.error(`Error fetching csv for Notion Analysis: ${error}`);
  }
}

// document.addEventListener("DOMContentLoaded", plotData);
