// Import the functions you need from the SDKs you need
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
    getFirestore,
    query,
    collection,
    getDoc,
    getDocs,
    setDoc,
    doc,
    addDoc,
    deleteDoc,
    onSnapshot,
    orderBy,
    where,
    limit,
    average,
    sum,
    count,
    getAggregateFromServer,
    getCountFromServer,
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

const attendeeCol = collection(db, "home-page", "digitalNorway", "attendees")

google.charts.load("current", { packages: ["corechart"] });

document.addEventListener("DOMContentLoaded", event => {
    // Load Google Chart elements

    updateFieldBtns()
    
    const form = document.getElementById("form");
    const removeBtn = document.getElementById("remove");
    
    const openRegistrationBtn = document.getElementById('open-registration-btn')
    const openGraphBtn = document.getElementById('open-graph-btn')
    
    const closePopUpBtn = document.getElementById('close')
    
    const chartContainer = document.getElementById('content')

    clickSubmit(form)
    clickRemove(removeBtn)

    clickOpenRegistration(openRegistrationBtn)
    clickOpenGraph(openGraphBtn, chartContainer)
    
    clickClosePopUp(closePopUpBtn)
    
    
})


function clickOpenRegistration(openRegistrationBtn) {
    openRegistrationBtn.addEventListener('click', function() {
        document.getElementById('pop-up').style.display = 'block';
        document.getElementById('registration').style.display = 'block';
        document.getElementById('graph').style.display = 'none';
    });   
}


function clickOpenGraph(openGraphBtn, chartContainer) {
    openGraphBtn.addEventListener('click', function() {
        document.getElementById('pop-up').style.display = 'block';
        document.getElementById('registration').style.display = 'none';
        document.getElementById('graph').style.display = 'block';
        
        generateAndShowGraph(chartContainer)
    });  
}

function clickClosePopUp(closePopUpBtn) {
    closePopUpBtn.addEventListener('click', event => {
        document.getElementById('pop-up').style.display = 'none';
    });
}


async function generateAndShowGraph(container) {
    const q_TRUE = query(attendeeCol, where("member", "==", true));
    const snapshot_TRUE = await getCountFromServer(q_TRUE);
    
    const q_FALSE = query(attendeeCol, where("member", "==", false));
    const snapshot_FALSE = await getCountFromServer(q_FALSE);

    console.log('Members: ', snapshot_TRUE.data().count);
    console.log('Non-members: ', snapshot_FALSE.data().count);

    // Lage tabellen med data
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Medlem');
    data.addColumn('number', 'Antall');

    data.addRow(['Medlemmer', snapshot_TRUE.data().count]); // First number
    data.addRow(['Ikke-Medlemmer', snapshot_FALSE.data().count]); // Second number

    var options = {
        title: 'Antall Medlemmer og Ikke-Medlemmer',
        legend: { position: 'none' },
        scales: {
            y: {
                ticks: {
                    precision: 0
                }
            }
        }
    };

    var chart = new google.visualization.BarChart(container);
    chart.draw(data, options);
}



function updateFieldBtns() {
    enableFields()
    disableFields()
}

function disableFields() {
    // Deaktiverer inntastingsfelt og/eller 
    if (localStorage.getItem('påmeldingID')) {
        const alleInputFelt = form.querySelectorAll("input");
        alleInputFelt.forEach(element => {
            element.disabled = true;
            element.style.cursor = "not-allowed";
        })
    } else {
        const removeBtn = document.getElementById("remove")
        removeBtn.disabled = false;
        removeBtn.style.cursor = "not-allowed";
    }
}

function enableFields() {
    // Aktiverer inntastingsfelt og/eller knapper 
    
    if (!localStorage.getItem('påmeldingID')) {
        const alleInputFelt = form.querySelectorAll("input");
        alleInputFelt.forEach(element => {
            element.disabled = false;
            element.style.cursor = "pointer";
        })
    } else {
        const removeBtn = document.getElementById("remove")
        removeBtn.disabled = false;
        removeBtn.style.cursor = "pointer";
    }

}




function clickSubmit(formEl) {

    // legger til påmelding i Firebase

    formEl.addEventListener("submit", async event => {
        
        // forhindrer standard oppførsel for skjemaet (f.eks. sideomlasting)
        event.preventDefault();
        
        
        // henter verdiene i skjemaet
        const nameVal = document.getElementById("name").value;
        const telVal = document.getElementById("tel").value;
        const emailVal = document.getElementById("email").value;
        const memberVal = document.getElementById("member").checked;
        
        
        // legg til dokument/påmelding i database med id. (samme i database og localStorage)
        
        const d = await addDoc(attendeeCol, {
            name: nameVal,
            tel: telVal,
            email: emailVal,
            member: memberVal
        });
        
        
        // unik ID lagres lokalt for å kunne slettes
        localStorage.setItem('påmeldingID', d.id);
        
        updateFieldBtns()
        
    })

}

function clickRemove(removeBtn) {

    // fjerner påmelding basert på lokalt lagret ID
    removeBtn.addEventListener("click", async function() {
        const påmeldingID = localStorage.getItem('påmeldingID');

        if (påmeldingID) {

            // Slett påmeldingen fra databasen basert på den lagrede ID-en
            await deleteDoc(doc(attendeeCol, påmeldingID));

            // Tilbakestill den lokale lagringen
            localStorage.removeItem('påmeldingID');

            // Tilbakestill skjemaet
            form.reset();

            const skjemafelt = form.querySelectorAll("input");
            skjemafelt.forEach(function(element) {
                element.disabled = false;
                element.style.cursor = "pointer";
        })}
        else {
            alert("Ingen påmelding å slette")
        }
        updateFieldBtns()
    })
}





