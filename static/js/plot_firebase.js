// Import the functions you need from the SDKs you need
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
    getFirestore,
    query,
    collection,
    getDoc,
    getDocs,
    doc,
    onSnapshot,
    orderBy,
    where,
    limit,
    average,
    sum,
    count,
    getAggregateFromServer
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_mnZupO4Y8-qDm_0UiXWf7zw4HLxoXjI",
    authDomain: "blu-hp.firebaseapp.com",
    projectId: "blu-hp",
    storageBucket: "blu-hp.appspot.com",
    messagingSenderId: "700062325335",
    appId: "1:700062325335:web:579a4136f7d877276ca112",
    measurementId: "G-PW4V6EKVDB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// console.log("Det Funket! Her er objektet for databasen:");
// console.log(db);

document.addEventListener("DOMContentLoaded", () => {
    let button = document.getElementById("plotDataBtn");

    if (button) {
        button.addEventListener("click", () => {
            clearContentEl()
            plotSleepTime()
            plotNumbers()
        });
    }
});


function clearContentEl() {
    container.innerHTML = ""
}

// Load Google Chart elements
google.charts.load("current", { packages: ["corechart"] });
const container = document.querySelector("#content");

const collection_date = collection(db, "home-page", "science-analysis", "By Date")
const collection_data_point = collection(db, "home-page", "science-analysis", "By Data Point")

async function plotSleepTime() {
    const sleepLengthEl = document.createElement("div")
    sleepLengthEl.id = "Sovnlengde"
    container.appendChild(sleepLengthEl)

    function queryDay(day) {
        return query(collection_date, where("Dag", "==", day))
    }

    const days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lordag", "Sondag"];
    const dataList = [["Natt til..", "Timer"]]
    
    days.forEach(async (day) => {
        
        const q = query(collection_date, where("Dag", "==", day))
        const snapshot = await getAggregateFromServer(q, {
            averageLength: average("Sovnlengde")
        });
        // console.log(day, snapshot.data().averageLength)

        // dataList.push([day, sum/count])
        // const data = google.visualization.arrayToDataTable(dataList, false);
    
        //   const options = {
        //     chart: {
        //       title: 'Søvnmengde',
        //       subtitle: 'Timer søvn, gjennomsnittlig per dag',
        //     }
        //   };
    
        //   const chart = new google.charts.Bar(sleepLengthEl);
    
        //   chart.draw(data, google.charts.Bar.convertOptions(options));
    });
    
}

async function plotNumbers() {
    const statsToPlot = ["Dato", "Hvilepuls", "HRV", "Aktivitet", "Sovnlengde", "Kroppstemperatur", "Romtemperatur", "Sykluser", "Tid", ]
    const dataList = [[...statsToPlot]];


    statsToPlot.forEach(async (point) => {
        const containerEl = document.createElement("div")
        containerEl.id = point
        container.appendChild(containerEl)

    })
    
    const q = query(collection_date, orderBy("Dato"))
    const snaphot = await getDocs(q)

    snaphot.forEach(doc => {
        const data = doc.data()
        const new_line = []
       
        statsToPlot.forEach(point => {
            new_line.push(data[point])
        })

        dataList.push(new_line)
    })

    
     const data = google.visualization.arrayToDataTable(dataList, false);
    
    const options = {
        title: 'Alle Talldata',
    };

    const chart = new google.visualization.LineChart(container);
    chart.draw(data, options);

    
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
