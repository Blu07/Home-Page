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
    google.charts.load("current", { packages: ["corechart", "line", "bar", "table"] });
    
    drawButtons("stat", allNumberStats, statButtonsContainer)
    drawButtons("filter", filters, filterButtonsContainer)
    drawButtons("chartType", chartTypes, chartTypeButtonsContainer)
    
    addEventListener('resize', updateChart)
    
    google.charts.setOnLoadCallback(() => {
        drawClassQueryTable(container_1)
        updateChart()
    });
    
    
    
});

const container_1 = document.querySelector("#content-1");
const container_2 = document.querySelector("#content-2");
const statButtonsContainer = document.querySelector("#stats");
const filterButtonsContainer = document.querySelector("#filters");
const chartTypeButtonsContainer = document.querySelector("#chartTypes");


const collection_date = collection(db, "home-page", "science-analysis", "By Date")
const collection_data_point = collection(db, "home-page", "science-analysis", "By Data Point")


const allNumberStats = ["Hvilepuls", "HRV", "Aktivitet", "Sovnlengde", "Kroppstemperatur", "Romtemperatur", "Sykluser", "Tid",]
allNumberStats.sort()

const filters = ["Kronologisk", "Ukedag"]
const chartTypes = ["Bar", "Linje"]


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
                // viewWindow: {
                //     min: 0 // Ensure Y-axis starts at 0 for the first axis
                // }
            },
            1: { 
                title: stats[1],
                // viewWindow: {
                //     min: 0 // Ensure Y-axis starts at 0 for the second axis
                // }
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
    // Filtering out non-numeric values and then using Math.min() to get the minimum value
    const lowest_stat1 = Math.min(...dataList.map(list => list[1]).filter(value => typeof value === 'number'));
    const lowest_stat2 = Math.min(...dataList.map(list => list[2]).filter(value => typeof value === 'number'));
    const lowest_stat3 = Math.min(...dataList.map(list => list[3]).filter(value => typeof value === 'number'));
    // console.log(lowest_stat1)
    // console.log(lowest_stat2)

    const data = google.visualization.arrayToDataTable(dataList, false);
    const options = {
        chart: {
            title: 'Kronologiske Statistikker',
            subtitle: 'Viser verdier for ' + (stats.slice(0, -1).join(", ") || "") + (stats.length > 1 ? " og " : "") + stats.slice(-1),
        },
        series: {
            0: { targetAxisIndex: 0 }, // Use numerical indices for targetAxisIndex
            1: { targetAxisIndex: 1 },
            2: { targetAxisIndex: 2 }
        },
        vAxes: {
            0: { 
                title: stats[1],
                viewWindow: {
                    min: Math.min(0, lowest_stat1) < 0 ? null : 0 // Ensure Y-axis starts at 0 for the second axis if no values are below 0
                }
            },
            1: { 
                title: stats[1],
                viewWindow: {
                    min: Math.min(0, lowest_stat2) < 0 ? null : 0 // Ensure Y-axis starts at 0 for the second axis if no values are below 0
                }
            },
            2: { 
                title: stats[1],
                viewWindow: {
                    min: Math.min(0, lowest_stat2) < 0 ? null : 0 // Ensure Y-axis starts at 0 for the second axis if no values are below 0
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
        case "Linje":
            chart = new google.charts.Line(container_2);
            convertedOptions = google.charts.Line.convertOptions(options);
            break;

        case "Bar":
            chart = new google.charts.Bar(container_2);
            convertedOptions = google.charts.Bar.convertOptions(options);
            break;

        default:
            chart = new google.charts.Bar(container_2);
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

function registerStatButton(event) {    // , container) {
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
    
    if (stats.length == 0) {
        return false
    }

    // Determine which function to call based on the filter
    let dataOptions;
    if (filter === "Kronologisk") {
        dataOptions = await structureDataByDate(stats);
    } else if (filter === "Ukedag") {
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


async function drawClassQueryTable(container) {
    
    const values = [
        [2,   9,  [7, 50]],
        [1,  12,  [6, 15]],
        [1,  20,  [7, 30]],
        [2,   2,  [8, 25]],
        [12, 75,  [3,  0]],
        [2,  12,  [6, 30]],
        [1,   1,  [6, 50]],
        [3,  10,  [7,  0]],
        [14, 30,  [8, 30]],
        [1,   3,  [7, 45]],
        [2,   5,  [5, 30]],
        [2,   5,  [6,  0]],
        [0,   0,  [7, 50]],
        [5,  45,  [6,  0]],
        [12, 60,  [7,  0]],
        [8,  40,  [6, 30]],
        [4,  25,  [7,  0]],
        [1,   5,  [6, 30]],
        [4,  15,  [6,  0]],
        [5,  30,  [5, 30]],
        [5,  30,  [5, 30]],
        [5,  30,  [6,  0]],
        [5,  40,  [6,  0]],
        [3,  18,  [7, 45]],
        [1,   1,  [7,  0]],
        [10, 30,  [6,  0]],
        [1,   1,  [7,  0]],
        [3,  18,  [8,  0]],
    ]


    const data = new google.visualization.DataTable();
    data.addColumn('number', 'Alarmer');
    data.addColumn('number', 'Tid');
    data.addColumn('number', 'Søvnlengde');
        
    
    values.forEach(row => {
        const A_V = row[0]
        const A_F = `${A_V} stk.`
        const T_V = row[1]
        const T_F = `${T_V} min`
        const S_V = row[2][0]*60 + row[2][1]*(3/5)
        const S_F = `${row[2][0]}:${row[2][1]}`
        
        const add_row = [{v: A_V, f: A_F},
                         {v: T_V, f: T_F},
                         {v: S_V, f: S_F}]
        console.log(add_row)
        data.addRow(add_row);
    })

    const table = new google.visualization.Table(container);
    const options = {showRowNumber: true, width: '100%', height: '100%'}
    table.draw(data, options);

}

// Ubrukte funksjoner, trengs kanskje.

// function timeToDecimal(t, dec = 2) {
//     const decimal = Math.floor(t) + (5 / 3) * (t - Math.floor(t)) // Whole number + decimal version of original decimal (from 8.07): 8 + 0.12 , .07 -> .12
//     return round(decimal, dec)
// }


// function decimalToTime(d) {
//     return round(Math.floor(d) + (3 / 5) * (d - Math.floor(d)))
// }

