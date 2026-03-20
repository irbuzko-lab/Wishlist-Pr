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

// Прив'язуємо функції до window, щоб HTML їх бачив
window.openModal = function(key) {
    const item = currentData[key];
    if (!item) return;
    const modalDetails = document.getElementById("modalDetails");
    modalDetails.innerHTML = `
        ${item.image ? `<img src="${item.image}" style="width:100%">` : ""}
        <h2>${item.name}</h2>
        <p>Ціна: ${item.price} грн</p>
        <p>Магазин: ${item.store}</p>
        <p>Пріоритет: ${item.priority}/5</p>
    `;
    document.getElementById("itemModal").classList.remove("hidden");
};

window.deleteItem = function(key) {
    if (confirm("Видалити?")) {
        remove(ref(db, `wishlists/${currentUser}/${key}`));
    }
};

// Робота з інтерфейсом
const itemForm = document.getElementById("itemForm");

document.getElementById("addItemBtn").onclick = () => {
    itemForm.classList.remove("hidden");
};

document.getElementById("cancelBtn").onclick = () => {
    itemForm.classList.add("hidden");
};

// Вкладки
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentUser = btn.getAttribute("data-user");
        loadData();
    };
});

// Додавання
itemForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById("itemName").value;
    const price = parseFloat(document.getElementById("itemPrice").value);
    const category = document.getElementById("itemCategory").value;
    const store = document.getElementById("itemStore").value;
    const priority = document.getElementById("itemPriority").value;
    const file = document.getElementById("itemImageFile").files[0];

    const send = (img = "") => {
        push(ref(db, 'wishlists/' + currentUser), { name, price, category, store, priority, image: img });
        itemForm.reset();
        itemForm.classList.add("hidden");
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => send(ev.target.result);
        reader.readAsDataURL(file);
    } else {
        send();
    }
};

// Завантаження
function loadData() {
    onValue(ref(db, 'wishlists/' + currentUser), (snapshot) => {
        const data = snapshot.val();
        currentData = data || {};
        const container = document.getElementById("itemList");
        container.innerHTML = "";
        let total = 0;

        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];
                total += parseFloat(item.price);
                container.innerHTML += `
                    <div class="item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                        <div onclick="openModal('${key}')" style="flex-grow:1; cursor:pointer;">
                            <strong>${item.name}</strong> — ${item.price} грн
                        </div>
                        <button class="deleteBtn" onclick="deleteItem('${key}')">❌</button>
                    </div>
                `;
            });
        }
        document.getElementById("totalSum").textContent = `Сума: ${total} грн`;
    });
}

// Закриття модалки
document.querySelector(".close-modal").onclick = () => document.getElementById("itemModal").classList.add("hidden");

loadData();
