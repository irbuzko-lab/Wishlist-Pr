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

Ось повний код JS з усіма виправленнями. Я додав туди іконки кошика, правильну обробку видалення та оновлену логіку відображення.

Зверни увагу: я додав event.stopPropagation() у функцію видалення, щоб коли ти натискаєш на кошик, у тебе не відкривалося одночасно велике фото.

Оновлений script.js
JavaScript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Твій конфіг (залиш свої дані тут)
const firebaseConfig = {
    apiKey: "ТВІЙ_КЛЮЧ",
    authDomain: "wishlist-app-848bc.firebaseapp.com",
    databaseURL: "https://wishlist-app-848bc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "wishlist-app-848bc",
    storageBucket: "wishlist-app-848bc.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = "Іринка"; // Початковий користувач
let currentData = {};

// 1. Відкрити фото на весь екран
window.openModal = function(key) {
    const item = currentData[key];
    if (!item) return;
    
    const modal = document.getElementById("itemModal");
    const details = document.getElementById("modalDetails");
    
    details.innerHTML = `
        <img src="${item.image}" style="max-width:100%; border-radius:15px;">
        <p style="margin-top:15px; font-weight:600;">${item.comment || 'Без коментаря'}</p>
    `;
    modal.classList.remove("hidden");
};

// 2. Видалення (з іконкою кошика)
window.deleteItem = function(event, key) {
    event.stopPropagation(); // Зупиняємо відкриття модалки при кліку на кошик
    if(confirm("Видалити це бажання?")) {
        remove(ref(db, `wishlists/${currentUser}/${key}`));
    }
};

// 3. Закриття модалки
document.querySelector(".close-modal").onclick = () => {
    document.getElementById("itemModal").classList.add("hidden");
};

// 4. Перемикання користувачів (Таби)
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        // Змінюємо візуальний стан кнопок
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        // Оновлюємо поточного користувача за даними з атрибута data-user
        currentUser = btn.getAttribute("data-user");
        loadData(); // Перезавантажуємо список для нового юзера
    };
});

// 5. Показ/приховування форми
document.getElementById("addItemBtn").onclick = () => {
    const form = document.getElementById("itemForm");
    form.classList.toggle("hidden");
};

document.getElementById("cancelBtn").onclick = () => {
    document.getElementById("itemForm").classList.add("hidden");
};

// 6. Збереження нового бажання (Фото + Коментар)
document.getElementById("itemForm").onsubmit = function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById("itemImageFile");
    const file = fileInput.files[0];
    const comment = document.getElementById("itemComment").value;

    if (!file) {
        alert("Будь ласка, спочатку вибери фото!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function() {
        const base64Image = reader.result; // Перетворюємо фото в рядок
        
        push(ref(db, `wishlists/${currentUser}`), {
            image: base64Image,
            comment: comment
        }).then(() => {
            e.target.reset(); // Очищуємо форму
            document.getElementById("itemForm").classList.add("hidden");
        });
    };
    reader.readAsDataURL(file);
};

// 7. Головна функція завантаження списку
function loadData() {
    const container = document.getElementById("itemList");
    
    onValue(ref(db, `wishlists/${currentUser}`), (snapshot) => {
        const data = snapshot.val();
        currentData = data || {};
        container.innerHTML = "";

        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];
                
                // Створюємо картку: при кліку на неї - модалка, при кліку на кнопку в ній - видалення
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
            container.innerHTML = `
                <p style="grid-column: 1/3; text-align: center; color: #999; padding: 20px;">
                    У ${currentUser} поки немає бажань...
                </p>`;
        }
    });
}

// Запускаємо при першому вході
loadData();;
