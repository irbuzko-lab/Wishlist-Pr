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

// Відкрити модалку з повним фото
window.openModal = function(key) {
    const item = currentData[key];
    const modal = document.getElementById("itemModal");
    const details = document.getElementById("modalDetails");
    
    details.innerHTML = `
        <img src="${item.image}" alt="photo">
        <h2>${item.name}</h2>
        <p>${item.comment || ''}</p>
    `;
    modal.classList.remove("hidden");
};

// Видалення (тільки через іконку)
window.deleteItem = function(e, key) {
    e.stopPropagation(); // Щоб не відкривалася модалка при натисканні на кошик
    if(confirm("Видалити цю річ?")) {
        remove(ref(db, `wishlists/${currentUser}/${key}`));
    }
};

// Закриття модалки
document.querySelector(".close-modal").onclick = () => {
    document.getElementById("itemModal").classList.add("hidden");
};

// Перемикання табів
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentUser = btn.getAttribute("data-user");
        loadData();
    };
});

// Кнопки форми
document.getElementById("addItemBtn").onclick = () => document.getElementById("itemForm").classList.remove("hidden");
document.getElementById("cancelBtn").onclick = () => document.getElementById("itemForm").classList.add("hidden");

// Додавання товару з фото
document.getElementById("itemForm").onsubmit = function(e) {
    e.preventDefault();
    const file = document.getElementById("itemImageFile").files[0];
    const name = document.getElementById("itemName").value;
    const comment = document.getElementById("itemComment").value;

    const reader = new FileReader();
    reader.onload = function() {
        const base64Image = reader.result;
        push(ref(db, 'wishlists/' + currentUser), {
            name: name,
            comment: comment,
            image: base64Image
        });
        e.target.reset();
        document.getElementById("itemForm").classList.add("hidden");
    };
    reader.readAsDataURL(file);
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
                    <div class="item-card" onclick="openModal('${key}')">
                        <img src="${item.image}">
                        <div class="item-card-info">
                            <strong>${item.name}</strong>
                        </div>
                        <button class="delete-btn" onclick="deleteItem(event, '${key}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            });
        } else {
            container.innerHTML = "<p style='text-align:center; grid-column: 1/3;'>Список порожній</p>";
        }
    });
}

loadData();
