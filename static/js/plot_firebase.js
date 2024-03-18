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
    addButtons(allNumberStats)

    document.getElementById("sleepAVG").addEventListener('click', plotSleepTime)
    
});


function clearContentEl() {
    container.innerHTML = ""

    Object.values(document.getElementsByClassName("active")).forEach(element => {
        element.classList.remove("active")
    })
}

// Load Google Chart elements
google.charts.load("current", { packages: ["corechart", "line"] });
const container = document.querySelector("#content");
const buttonsContainer = document.querySelector("#buttons");

const collection_date = collection(db, "home-page", "science-analysis", "By Date")
const collection_data_point = collection(db, "home-page", "science-analysis", "By Data Point")


async function plotSleepTime() {
    clearContentEl()
    
    const days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lordag", "Sondag"];
    const dataList = [["Natt til..", "Timer"]]
    
    days.forEach(async (day) => {
        
        const q = query(collection_date, where("Dag", "==", day))
        const snapshot = await getAggregateFromServer(q, {
            averageLength: average("Sovnlengde")
        });
        const avgLen = snapshot.data().averageLength
        dataList.push([day, round(avgLen, 2)])

        const data = google.visualization.arrayToDataTable(dataList, false);
        
        const options = {
            chart: {
                title: 'Søvnmengde',
                subtitle: 'Timer søvn, gjennomsnittlig per dag',
            },
            vAxis: {
                minValue: 0,
                viewWindow: {
                    min: 0
                }
            }
        };

        const chart = new google.visualization.ColumnChart(container);

        chart.draw(data, options);
    });
    
}

const allNumberStats = ["Hvilepuls", "HRV", "Aktivitet", "Sovnlengde", "Kroppstemperatur", "Romtemperatur", "Sykluser", "Tid", ]


async function plotNumbers(stats=["HRV", "Hvilepuls"]) {
    const statsToPlot = ["Dato", ...stats] 
    const dataList = [statsToPlot];
    


    const q = query(collection_date, orderBy("Dato"))
    const snaphot = await getDocs(q)

    snaphot.forEach(doc => {
        const data = doc.data()
        const new_line = []
       
        statsToPlot.forEach(point => {
            let d = data[point]

            if (point === "Dato") {
                d = new Date(d).toISOString().split("T")[0];
            }

            new_line.push(d)
        })
        dataList.push(new_line)
    })
    
    
     const data = google.visualization.arrayToDataTable(dataList, false);
    
    const options = {
        title: 'Alle Talldata',
        subtitle: 'i par',
        series: {
            // Gives each series an axis name that matches the Y-axis below.
            0: {axis: '0'},
            1: {axis: '1'}
          },
          axes: {
            // Adds labels to each axis; they don't have to match the axis names.
            y: {
              0: {label: stats[0]},
              1: {label: stats[1]}
            }
          }
    };


    const chart = new google.charts.Line(container);
    chart.draw(data, google.charts.Line.convertOptions(options));
    // const chart = new google.visualization.LineChart(container);
    // chart.draw(data, options);

    
}


function addButtons(statList) {
    statList.forEach(point => {
        const btnEl = document.createElement("btn")
        btnEl.id = point
        btnEl.innerText = point
        btnEl.classList.add("potent")
        buttonsContainer.appendChild(btnEl)
        
        btnEl.addEventListener('click', (event) => registerActiveButton(event))
        
    })
}


function registerActiveButton(event) {
    const preActiveButtons = [...buttonsContainer.getElementsByClassName("active")];
    const element = event.target;

    if (element.classList.contains("active")) {
        element.classList.remove("active");
        return;
    }

    if (preActiveButtons.length >= 2) {
        return;
    }

    element.classList.add("active");

    if (preActiveButtons.length === 1) {
        plotNumbers([preActiveButtons[0].id, element.id]);
    }

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
