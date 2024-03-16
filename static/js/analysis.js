const { Client } = require("@notionhq/client");
const fs = require("fs");
require("dotenv").config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function queryDatabase() {
  const database = await notion.databases.query({
    database_id: "6844d8419a974a2baba0096e9c3975df",
  });

  const results = database.results;
  results.sort(
    (a, b) =>
      (new Date(a.properties.Dato.date.start) || 0) -
      (new Date(b.properties.Dato.date.start) || 0)
  );

  const headers = Object.keys(results[2].properties);

  let collection = [];

  results.forEach((page) => {
    let document = {};
    Object.entries(page.properties).forEach(([prop_name, value]) => {
      document[prop_name] = handleProperty(value);
    });
    collection.push(document);
  });

  collection.forEach((day) => {
    // document ID is the date in format YYYY-MM-DD
    const dateString = new Date(day.Dato).toISOString().split("T")[0];
    console.log(dateString);
  });

  collection = JSON.stringify(collection, null, 2);
  
                  


  fs.writeFileSync("uploads/analysisNotion.json", collection);
}

function handleProperty(prop) {
  const type = prop.type;

  if (!prop[type]) {
    return null;
  }

  switch (type) {
    case "select":
      return handleSelect(prop);
    case "number":
      return handleNumber(prop);
    case "date":
      return handleDate(prop);
    case "multi_select":
      return handleMultiSelect(prop);
    case "title":
      return handleTitle(prop);
    default:
      return handleUnknown(prop);
  }
}

function handleSelect(prop) {
  name_value = {
    "<30min": 0,
    ">30min": 1,

    Underholdning: 0,
    Produktivitet: 1,

    Lett: 0,
    Vanskelig: 1,

    Lav: 0,
    Høy: 1,

    "Vanlig lavt": 0,
    Forstyrrelser: 1,

    Opplagt: 0.9,
    Gjesper: 0.8,
    "Mister Fokus": 0.5,
    Sliten: 0.3,
    Sovner: 0.1,

    REM: 1,
    Core: 2,
    Deep: 3,
  };

  return prop.select.name;
  // return name_value[prop.select.name];
}

function handleNumber(prop) {
  return prop.number;
}

function handleDate(prop) {
  return new Date(prop.date.start).toISOString();
}

function handleMultiSelect(prop) {
  return prop.multi_select.map((s) => s.name);
}

function handleTitle(prop) {
  return prop.title[0].plain_text;
}

function handleUnknown(prop) {
  console.log("Unknown type of property:", prop);
  return null; // You can adjust this based on your needs
}

queryDatabase();
