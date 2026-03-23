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

// Відкрити фото на весь екран
window.openModal = function(key) {
    const item = currentData[key];
    const modal = document.getElementById("itemModal");
    document.getElementById("modalDetails").innerHTML = `
        <img src="${item.image}">
        <p>${item.comment || ''}</p>
    `;
    modal.classList.remove("hidden");
};

// Видалення
window.deleteItem = function(e, key) {
    e.stopPropagation();
    if(confirm("Видалити це бажання?")) {
        remove(ref(db, `wishlists/${currentUser}/${key}`));
    }
};

// Перемикання користувачів
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentUser = btn.getAttribute("data-user");
        loadData();
    };
});

// Кнопки інтерфейсу
document.getElementById("addItemBtn").onclick = () => document.getElementById("itemForm").classList.toggle("hidden");
document.getElementById("cancelBtn").onclick = () => document.getElementById("itemForm").classList.add("hidden");
document.querySelector(".close-modal").onclick = () => document.getElementById("itemModal").classList.add("hidden");

// Збереження нового бажання
document.getElementById("itemForm").onsubmit = function(e) {
    e.preventDefault();
    const file = document.getElementById("itemImageFile").files[0];
    const comment = document.getElementById("itemComment").value;

    if (!file) return alert("Будь ласка, обери фото");

    const reader = new FileReader();
    reader.onload = function() {
        push(ref(db, `wishlists/${currentUser}`), {
            image: reader.result,
            comment: comment
        });
        e.target.reset();
        document.getElementById("itemForm").classList.add("hidden");
    };
    reader.readAsDataURL(file);
};

// Завантаження списку
function loadData() {
    onValue(ref(db, `wishlists/${currentUser}`), (snapshot) => {
        const data = snapshot.val();
        currentData = data || {};
        const container = document.getElementById("itemList");
        container.innerHTML = "";

        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];
                container.innerHTML += `
                    <div class="wish-card" onclick="openModal('${key}')">
                        <img src="${item.image}">
                        <button class="delete-btn" onclick="deleteItem(event, '${key}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            });
        } else {
            container.innerHTML = "<p style='grid-column: 1/3; text-align: center; color: #999; margin-top: 20px;'>Тут поки порожньо...</p>";
        }
    });
}

loadData();
