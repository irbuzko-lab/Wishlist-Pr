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

let currentUser = "Аллочки"; 
let currentData = {};

// 1. Відкрити фото на весь екран (Модалка)
window.openModal = function(key) {
    const item = currentData[key];
    if (!item) return;
    document.getElementById("modalDetails").innerHTML = `
        <img src="${item.image}" style="max-width:100%; border-radius:15px;">
        <p style="margin-top:15px; font-weight:600; font-size: 1.2rem;">${item.comment || ''}</p>
    `;
    document.getElementById("itemModal").classList.remove("hidden");
};

// 2. Видалення
window.deleteItem = function(e, key) {
    e.stopPropagation(); // Важливо: щоб не відкривалася модалка при натисканні на кошик
    if(confirm("Видалити це бажання?")) {
        remove(ref(db, `wishlists/${currentUser}/${key}`));
    }
};

// 3. Таби (Перемикання між людьми)
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentUser = btn.getAttribute("data-user");
        loadData();
    };
});

// 4. Керування кнопками інтерфейсу
document.getElementById("addItemBtn").onclick = () => document.getElementById("itemForm").classList.toggle("hidden");
document.getElementById("cancelBtn").onclick = () => document.getElementById("itemForm").classList.add("hidden");
document.querySelector(".close-modal").onclick = () => document.getElementById("itemModal").classList.add("hidden");

// 5. Збереження (Фото + Коментар)
document.getElementById("itemForm").onsubmit = function(e) {
    e.preventDefault();
    const file = document.getElementById("itemImageFile").files[0];
    const comment = document.getElementById("itemComment").value;

    if (!file) return alert("Виберіть фото!");

    const reader = new FileReader();
    reader.onload = function() {
        push(ref(db, `wishlists/${currentUser}`), {
            image: reader.result,
            comment: comment
        }).then(() => {
            e.target.reset();
            document.getElementById("itemForm").classList.add("hidden");
        });
    };
    reader.readAsDataURL(file);
};

// 6. Завантаження та відображення списку з підписами
function loadData() {
    onValue(ref(db, `wishlists/${currentUser}`), (snapshot) => {
        const data = snapshot.val();
        currentData = data || {};
        const container = document.getElementById("itemList");
        container.innerHTML = "";

        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];
                
                // Формуємо підпис, якщо він є
                const commentHtml = item.comment 
                    ? `<div class="wish-card-comment">${item.comment}</div>` 
                    : '';

                container.innerHTML += `
                    <div class="wish-card" onclick="openModal('${key}')">
                        <div class="wish-card-photo-wrapper">
                            <img src="${item.image}">
                            <button class="delete-btn" onclick="deleteItem(event, '${key}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        ${commentHtml}
                    </div>
                `;
            });
        } else {
            container.innerHTML = `<p style="grid-column: 1/3; text-align: center; color: #999; padding: 20px;">Список ${currentUser} порожній</p>`;
        }
    });
}

// Запускаємо при старті
loadData();
