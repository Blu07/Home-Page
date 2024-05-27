const { Client } = require("@notionhq/client");
const fs = require("fs");
require("dotenv").config();

const admin = require("firebase-admin");
const serviceAccount = require("../../config/firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

db = admin.firestore();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});


uploadToFireStore()

async function uploadToFireStore() {
    // Connect to Database in Notion
    const database = await notion.databases.query({
        database_id: "6844d8419a974a2baba0096e9c3975df",
    });

    const results = database.results;
    results.sort((a, b) => {
        if (a.properties.Dato.start !== undefined && a.properties.Dato.start !== undefined) {
            return (new Date(a.properties.Dato.date.start) || 0) - (new Date(b.properties.Dato.date.start) || 0)
        }
        return 0
    });
    
    const datapoint_names = Object.keys(results[2].properties);
    // Process the values of every property from Notion:
    // [Date: {Datapoint: value}]
    let col_by_DATE = [];
    results.forEach((page) => {
        let document = {};
        Object.entries(page.properties).forEach(([prop_name, value]) => {
            document[prop_name] = handleProperty(value);
        });
        col_by_DATE.push(document);
    });

    // Add to Firebase 'By Date' collection
    col_by_DATE.forEach(day => {
        // DateID in YYY-MM-DD
        const dateString = new Date(day.Dato).toISOString().split("T")[0];
        addDocToFirebase("home-page/science-analysis/By Date", dateString, day);
    });
    
    // Aggregate data from Firebase 'By Date':
    // [datapoint: {dateID: value}]
    const sleepCollectionRef = db.collection("home-page/science-analysis/By Date");
    const querySnapshot = await sleepCollectionRef.orderBy("Dato").get();
    
    let col_by_DP = {}
    
    datapoint_names.forEach(name => {
        col_by_DP[name] = {};
    });
    
    querySnapshot.forEach(doc => {
        const data = doc.data();
        
        datapoint_names.forEach(datapoint => {
            if (data[datapoint] !== undefined) {
                col_by_DP[datapoint][doc.id] = data[datapoint];
            }
        });
    });

    
    // Add to Firebase 'By Data Point' collection
    Object.entries(col_by_DP).forEach(([doc, value]) => {
        addDocToFirebase("home-page/science-analysis/By Data Point", doc, value);
    })


    // Write copies to local files in uploads/ as JSON
    // Read these files to understand the structure
    col_by_DATE_JSON = JSON.stringify(col_by_DATE, null, 2);
    col_by_DP_JSON = JSON.stringify(col_by_DP, null, 2);
    fs.writeFileSync("uploads/analysisNotionByDATE.json", col_by_DATE_JSON);
    fs.writeFileSync("uploads/analysisNotionByDATAPOINT.json", col_by_DP_JSON);
}


async function addDocToFirebase(collectionPath, docId, data) {
    const docRef = db.collection(collectionPath).doc(docId);
    await docRef.set(data);
    console.log(`Added to '${collectionPath}' document with ID '${docId}'`);
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
        // case "multi_select":
        //     return handleMultiSelect(prop);
        case "title":
            return handleTitle(prop);
        default:
            return handleUnknown(prop);
    }
}

function handleSelect(prop) {
    name_value = {
        "<30min": 0.5,
        ">30min": 0.7,

        Underholdning: 0.5,
        Produktivitet: 0.7,

        Vanskelig: 0.5,
        Lett: 0.7,

        Lav: 0.5,
        Høy: 0.7,

        Forstyrrelser: 0.5,
        "Vanlig lavt": 0.7,

        "5 min": 5,
        "10 min": 10,
        "20 min": 20,
        "60 min": 60,
        "Aldri": 0,

        Opplagt: 0.9,
        Gjesper: 0.8,
        "Mister Fokus": 0.5,
        Sliten: 0.3,
        Sovner: 0.1,

        REM: 1,
        Core: 2,
        Deep: 3,
    };

    // return prop.select.name;
    return name_value[prop.select.name];
}

function handleNumber(prop) {
    console.log(prop.id)
    if (prop.id === '%3DS%3DL') {
        return timeToDecimal(prop.number)
    }
    
    return prop.number;
}

function handleDate(prop) {
    return new Date(prop.date.start).toISOString();
}

// function handleMultiSelect(prop) {
//     return prop.multi_select.map((s) => s.name);
// }

function handleTitle(prop) {
    if (prop.title[0] !== undefined) {
        return prop.title[0].plain_text;
    }
    return "Day Unknown"
}

function handleUnknown(prop) {
    console.log("Unknown type of property:", prop);
    return null; // You can adjust this based on your needs
}





function timeToDecimal(t, dec=2) {
    const decimal = Math.floor(t) + (5/3)*(t - Math.floor(t)) // Whole number + decimal version of original decimal (from 8.07): 8 + 0.12 , .07 -> .12
    return round(decimal, dec)
}

function decimalToTime(d) {
    return round(Math.floor(d) + (3/5)*(d - Math.floor(d)))
}

function round(num, dec=2) {
    const dec_fac = Math.pow(10, dec)
    const rounded = Math.round(dec_fac*num)/dec_fac
    
    return rounded
}
