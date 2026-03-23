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

// UI
const itemForm = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");

document.getElementById("addItemBtn").onclick = () => {
    itemForm.classList.remove("hidden");
    itemList.classList.add("hidden");
};

document.getElementById("viewListBtn").onclick = () => {
    itemList.classList.remove("hidden");
    itemForm.classList.add("hidden");
};

document.getElementById("cancelBtn").onclick = () => {
    itemForm.classList.add("hidden");
};

// вкладки
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentUser = btn.getAttribute("data-user");
        loadData();
    };
});

// додавання
itemForm.onsubmit = (e) => {
    e.preventDefault();

    const comment = document.getElementById("itemComment").value;
    const file = document.getElementById("itemImageFile").files[0];

    if (!file) return alert("Додай фото!");

    const reader = new FileReader();
    reader.onload = (ev) => {
        push(ref(db, 'wishlists/' + currentUser), {
            image: ev.target.result,
            comment: comment || ""
        });
        itemForm.reset();
        itemForm.classList.add("hidden");
    };
    reader.readAsDataURL(file);
};

// завантаження
function loadData() {
    onValue(ref(db, 'wishlists/' + currentUser), (snapshot) => {
        const data = snapshot.val();
        currentData = data || {};

        itemList.innerHTML = "";

        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];

                itemList.innerHTML += `
                    <div class="photo-item">
                        <img src="${item.image}" onclick="openModal('${key}')">
                        <button class="deleteBtn" onclick="deleteItem('${key}')">🗑</button>
                    </div>
                `;
            });
        }
    });
}

// відкрити
window.openModal = function(key) {
    const item = currentData[key];
    if (!item) return;

    document.getElementById("modalDetails").innerHTML = `
        <img src="${item.image}">
        ${item.comment ? `<p>${item.comment}</p>` : ""}
    `;

    document.getElementById("itemModal").classList.remove("hidden");
};

// видалити
window.deleteItem = function(key) {
    remove(ref(db, `wishlists/${currentUser}/${key}`));
};

// закрити модалку
document.querySelector(".close-modal").onclick = () => {
    document.getElementById("itemModal").classList.add("hidden");
};

loadData();
