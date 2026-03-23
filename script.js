// ВСТАВ СВОЇ ДАНІ СЮДИ (уважно перевір databaseURL)
const firebaseConfig = {
  apiKey: "AIzaSyApJqI0W0HAybT-Y49QAH0jpOxjexuFC10",
  authDomain: "wishlist-app-848bc.firebaseapp.com",
  databaseURL: "https://wishlist-app-848bc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wishlist-app-848bc",
  storageBucket: "wishlist-app-848bc.appspot.com",
  messagingSenderId: "377772763628",
  appId: "1:377772763628:web:2a17b64e4cf566b55af8c9"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = "Іринка";
let currentData = {};

window.openModal = function(key) {
    const item = currentData[key];
    if (!item) return;

    document.getElementById("modalDetails").innerHTML = `
        <h2>${item.name}</h2>
        <p>${item.price} грн</p>
    `;

    document.getElementById("itemModal").classList.remove("hidden");
};

window.deleteItem = function(key) {
    remove(ref(db, `wishlists/${currentUser}/${key}`));
};

document.getElementById("addItemBtn").onclick = () => {
    document.getElementById("itemForm").classList.remove("hidden");
};

document.getElementById("cancelBtn").onclick = () => {
    document.getElementById("itemForm").classList.add("hidden");
};

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentUser = btn.getAttribute("data-user");
        loadData();
    };
});

document.getElementById("itemForm").onsubmit = (e) => {
    e.preventDefault();

    const name = document.getElementById("itemName").value;
    const price = document.getElementById("itemPrice").value;

    push(ref(db, 'wishlists/' + currentUser), { name, price });

    e.target.reset();
};

function loadData() {
    onValue(ref(db, 'wishlists/' + currentUser), (snapshot) => {
        const data = snapshot.val();
        currentData = data || {};

        const container = document.getElementById("itemList");
        container.innerHTML = "";

        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];

                container.innerHTML += `
                    <div onclick="openModal('${key}')">
                        ${item.name} - ${item.price}
                        <button onclick="deleteItem('${key}')">X</button>
                    </div>
                `;
            });
        }
    });
}

loadData();
