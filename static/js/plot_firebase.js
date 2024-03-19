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
    drawButtons("s", allNumberStats, statButtonsContainer)
    drawButtons("f", filters, filterButtonsContainer)
    filterButtonsContainer.firstChild.classList.add("active")

    document.getElementById("sleepAVG").addEventListener('click', () => {
        plotByDay("Sovnlengde")
    })

});



// Load Google Chart elements
google.charts.load("current", { packages: ["corechart", "line", "bar"] });
const container = document.querySelector("#content");
const statButtonsContainer = document.querySelector("#stats");
const filterButtonsContainer = document.querySelector("#filters");

const collection_date = collection(db, "home-page", "science-analysis", "By Date")
const collection_data_point = collection(db, "home-page", "science-analysis", "By Data Point")

const allNumberStats = ["Hvilepuls", "HRV", "Aktivitet", "Sovnlengde", "Kroppstemperatur", "Romtemperatur", "Sykluser", "Tid",]
allNumberStats.sort()

const filters = ["Chronological", "Weekday"]



async function plotByDay(stats = ["HRV", "Hvilepuls"]) {
    clearContentEl();

    const days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
    // Adjusting dataList to include both stats in the header
    const dataList = [["Natt til..", ...stats]];

    // Create an array of promises for each day to fetch data
    const dayPromises = days.map(async (day) => {
        // Assuming you have a way to get aggregates for both stats (simulating here)
        const promises = stats.map(stat => {
            const q = query(collection_date, where("Dag", "==", day));
            return getAggregateFromServer(q, { averageLength: average(stat) })
                .then(snapshot => snapshot.data().averageLength);
        });

        // Wait for both stats' data for the current day
        return Promise.all(promises).then((values) => {
            // Assuming the first value corresponds to the first stat and the second to the second stat, etc.
            return [day, ...values.map(value => round(value, 2))];
        });
    });

    // Wait for all day promises to resolve
    const resolvedDays = await Promise.all(dayPromises);

    // Since the days are in order, there's no need to sort, just push them into dataList
    resolvedDays.forEach(dayData => dataList.push(dayData));

    // Now that we have all the data, proceed to use it for charting
    const data = google.visualization.arrayToDataTable(dataList, false);

    const options = {
        chart: {
            title: 'Daglige Statistikker',
            subtitle: 'Viser verdier for ' + stats.join(" og "),
        },
        series: {
            0: { targetAxisIndex: 0 },
            1: { targetAxisIndex: 1 }
        },
        vAxes: {
            // Setter opp hver av Y-aksene
            0: { title: stats[0] },
            1: { title: stats[1] }
        },
        hAxis: {
            title: 'Dag',
        }
    };

    const chart = new google.charts.Bar(container);
    chart.draw(data, google.charts.Line.convertOptions(options));
}



async function plotByDate(stats = ["HRV", "Hvilepuls"]) {
    clearContentEl()

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
            0: { axis: '0' },
            1: { axis: '1' }
        },
        axes: {
            // Adds labels to each axis; they don't have to match the axis names.
            y: {
                0: { label: stats[0] },
                1: { label: stats[1] }
            }
        }
    };


    const chart = new google.charts.Line(container);
    chart.draw(data, google.charts.Line.convertOptions(options));
    // const chart = new google.visualization.LineChart(container);
    // chart.draw(data, options);


}

function drawButtons(type, baseList, containerEL, maxMarked) {
    baseList.forEach(name => {
        const btnEl = document.createElement("btn")
        btnEl.id = name
        btnEl.innerText = name
        btnEl.classList.add("potent")
        containerEL.appendChild(btnEl)

        if (type === "s") {
            btnEl.addEventListener('click', (event) => registerStatButton(event, containerEL, maxMarked))
        } else if (type === "f") {
            btnEl.addEventListener('click', (event) => registerFilterButton(event, containerEL, maxMarked))
        } else {
            console.error(`Button Type not recognised: ${type}`)
        }
    })
}



function registerStatButton(event, buttonsContainer) {
    const preActiveButtons = [...buttonsContainer.getElementsByClassName("active")];
    const activeFilterEl = [...filterButtonsContainer.getElementsByClassName("active")];
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
        const preActiveBtn = preActiveButtons[0].id
        const newActiveBtn = element.id
        const filter = activeFilterEl[0].id

        drawTable([preActiveBtn, newActiveBtn], filter)
    }

}

function drawTable(stats, filter, hei) {
    console.log("Drawing table:", stats, filter, hei)
    switch (filter) {
        case "Chronological":
            return plotByDate(stats);
        case "Weekday":
            plotByDay(stats);

    }


}

function registerFilterButton(event) {
    const preActiveButtons = [...filterButtonsContainer.getElementsByClassName("active")];
    const activeStatButtons = [...statButtonsContainer.getElementsByClassName("active")];
    const element = event.target;

    if (element.classList.contains("active")) {
        element.classList.remove("active");
        return;
    }

    preActiveButtons.forEach(activeFilter => {
        activeFilter.classList.remove("active")
    })

    if (preActiveButtons.length <= 1) {
        element.classList.add("active");

        const filter = element.id
        const stats = activeStatButtons.map((stat) => stat.id)

        drawTable(stats, filter)

    }

}

function clearContentEl() {
    container.innerHTML = ""

    // Object.values(document.getElementsByClassName("active")).forEach(element => {
    //     element.classList.remove("active")
    // })
}

function timeToDecimal(t, dec = 2) {
    const decimal = Math.floor(t) + (5 / 3) * (t - Math.floor(t)) // Whole number + decimal version of original decimal (from 8.07): 8 + 0.12 , .07 -> .12
    return round(decimal, dec)
}


function decimalToTime(d) {
    return round(Math.floor(d) + (3 / 5) * (d - Math.floor(d)))
}


function round(num, dec = 2) {
    const dec_fac = Math.pow(10, dec)
    const rounded = Math.round(dec_fac * num) / dec_fac

    return rounded
}
