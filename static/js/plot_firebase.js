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


document.addEventListener("DOMContentLoaded", () => {
    // Load Google Chart elements
    google.charts.load("current", { packages: ["corechart", "line", "bar"] });
    
    drawButtons("stat", allNumberStats, statButtonsContainer)
    drawButtons("filter", filters, filterButtonsContainer)
    drawButtons("chartType", chartTypes, chartTypeButtonsContainer)
    
    addEventListener('resize', updateChart)
    
    google.charts.setOnLoadCallback(updateChart);
});

const container = document.querySelector("#content");
const statButtonsContainer = document.querySelector("#stats");
const filterButtonsContainer = document.querySelector("#filters");
const chartTypeButtonsContainer = document.querySelector("#chartTypes");

const collection_date = collection(db, "home-page", "science-analysis", "By Date")
const collection_data_point = collection(db, "home-page", "science-analysis", "By Data Point")

const allNumberStats = ["Hvilepuls", "HRV", "Aktivitet", "Sovnlengde", "Kroppstemperatur", "Romtemperatur", "Sykluser", "Tid",]
allNumberStats.sort()

const filters = ["Chronological", "Weekday"]
const chartTypes = ["Bar", "Line"]


async function structureDataByDay(stats) {
    const days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lordag", "Sondag"];
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

    // Now that we have all the data
    const data = google.visualization.arrayToDataTable(dataList, false);
    const options = {
        chart: {
            title: 'Daglige Statistikker',
            subtitle: 'Viser verdier for ' + stats.join(" og "),
        },
        series: {
            0: { targetAxisIndex: 0 }, // Use numerical indices for targetAxisIndex
            1: { targetAxisIndex: 1 }
        },
        vAxes: {
            0: { 
                title: stats[0],
                viewWindow: {
                    min: 0 // Ensure Y-axis starts at 0 for the first axis
                }
            },
            1: { 
                title: stats[1],
                viewWindow: {
                    min: 0 // Ensure Y-axis starts at 0 for the second axis
                }
            }
        },
        hAxis: {
            title: 'Dag',
        }
    };
    
    return [data, options]
}

async function structureDataByDate(stats) {
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
        chart: {
            title: 'Kronologiske Statistikker',
            subtitle: 'Viser verdier for ' + stats.slice(0, -1).join(", ") + "og" + stats[-1],
        },
        series: {
            0: { targetAxisIndex: 0 }, // Use numerical indices for targetAxisIndex
            1: { targetAxisIndex: 1 }
        },
        vAxes: {
            0: { 
                title: stats[0],
                viewWindow: {
                    min: 0 // Ensure Y-axis starts at 0 for the first axis
                }
            },
            1: { 
                title: stats[1],
                viewWindow: {
                    min: 0 // Ensure Y-axis starts at 0 for the second axis
                }
            }
        },
        hAxis: {
            title: 'Dato',
        }
    };
    
    return [data, options]
}

function drawChartOfType(data, options, type) {
    let chart;
    let convertedOptions;

    switch (type) {
        case "Line":
            chart = new google.charts.Line(container);
            convertedOptions = google.charts.Line.convertOptions(options);
            break;

        case "Bar":
            chart = new google.charts.Bar(container);
            convertedOptions = google.charts.Bar.convertOptions(options);
            break;

        default:
            chart = new google.charts.Bar(container);
            convertedOptions = google.charts.Bar.convertOptions(options);
            break;
    }

    chart.draw(data, convertedOptions);
}

function drawButtons(type, baseList, containerEL) {
    baseList.forEach(name => {
        const btnEl = document.createElement("btn")
        btnEl.id = name
        btnEl.innerText = name
        btnEl.classList.add("potent")
        containerEL.appendChild(btnEl)

        if (type === "stat") {
            btnEl.addEventListener('click', (event) => registerStatButton(event, containerEL))
        } else if (type === "filter" || type === "chartType") {
            btnEl.addEventListener('click', (event) => registerFilterBtnPress(event, containerEL))
        } else {
            console.error(`Button Type not recognised: ${type}`)
        }
    })

    // Automatically select the first element as active in Filters and Chart Types
    containerEL.firstChild.classList.add("active")
}

function registerStatButton(event) {        // , container) {
    const element = event.target;
    
    // If clicked and active, toggle active off
    if (element.classList.contains("active")) {
        element.classList.remove("active");
        updateChart()
        return;
    }
    
    // const preActiveButtons = [...container.getElementsByClassName("active")];
    // Early return to disable selecting more than two stats at a time 
    // if (preActiveButtons.length >= 2) {
    //     return;
    // }

    element.classList.add("active");

    updateChart()
}

function registerFilterBtnPress(event, container) {
    const preActiveButtons = [...container.getElementsByClassName("active")];
    const element = event.target;

    // Remove all active buttons if there are multiple
    preActiveButtons.forEach(activeBtn => {
        activeBtn.classList.remove("active")
    })

    if (preActiveButtons.length <= 1) {
        element.classList.add("active");
        updateChart()
    }
}

async function updateChart() {
    const stats = [...statButtonsContainer.getElementsByClassName("active")].map((v) => v.id);
    const filter = [...filterButtonsContainer.getElementsByClassName("active")][0].id;
    const cType = [...chartTypeButtonsContainer.getElementsByClassName("active")][0].id;
   
    // Determine which function to call based on the filter
    let dataOptions;
    if (filter === "Chronological") {
        dataOptions = await structureDataByDate(stats);
    } else if (filter === "Weekday") {
        dataOptions = await structureDataByDay(stats);
    }

    // Destructure the returned array to get data and options
    const [data, options] = dataOptions;

    // Now, pass the data and options to drawChartOfType
    drawChartOfType(data, options, cType);
}


function round(num, dec = 2) {
    const dec_fac = Math.pow(10, dec)
    const rounded = Math.round(dec_fac * num) / dec_fac

    return rounded
}

// Ubrukte funksjoner, trengs kanskje.

// function timeToDecimal(t, dec = 2) {
//     const decimal = Math.floor(t) + (5 / 3) * (t - Math.floor(t)) // Whole number + decimal version of original decimal (from 8.07): 8 + 0.12 , .07 -> .12
//     return round(decimal, dec)
// }


// function decimalToTime(d) {
//     return round(Math.floor(d) + (3 / 5) * (d - Math.floor(d)))
// }

