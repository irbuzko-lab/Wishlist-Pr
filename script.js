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

// ЕЛЕМЕНТИ
const itemForm = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");
const modal = document.getElementById("itemModal");
const modalDetails = document.getElementById("modalDetails");

// ---------------- UI ----------------

// додати
document.getElementById("addItemBtn").onclick = () => {
    itemForm.classList.remove("hidden");
    itemList.classList.add("hidden");
};

// список
document.getElementById("viewListBtn").onclick = () => {
    itemList.classList.remove("hidden");
    itemForm.classList.add("hidden");
};

// скасувати
document.getElementById("cancelBtn").onclick = () => {
    itemForm.classList.add("hidden");
};

// вкладки
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentUser = btn.getAttribute("data-user");

        // очистка перед завантаженням
        itemList.innerHTML = "";
        loadData();
    };
});

// ---------------- ДОДАВАННЯ ----------------

itemForm.onsubmit = (e) => {
    e.preventDefault();

    const comment = document.getElementById("itemComment").value;
    const file = document.getElementById("itemImageFile").files[0];

    if (!file) {
        alert("Додай фото!");
        return;
    }

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

// ---------------- ЗАВАНТАЖЕННЯ ----------------

function loadData() {
    onValue(ref(db, 'wishlists/' + currentUser), (snapshot) => {
        const data = snapshot.val();
        currentData = data || {};

        itemList.innerHTML = "";

        if (!data) return;

        Object.keys(data).forEach(key => {
            const item = data[key];

            // якщо раптом биті дані — пропускаємо
            if (!item || !item.image) return;

            const div = document.createElement("div");
            div.className = "photo-item";

            // фото
            const img = document.createElement("img");
            img.src = item.image;

            img.onclick = () => {
                openModal(key);
            };

            // кнопка видалення
            const btn = document.createElement("button");
            btn.className = "deleteBtn";
            btn.textContent = "🗑";

            btn.onclick = (e) => {
                e.stopPropagation(); // 💥 не відкриває модалку
                deleteItem(key);
            };

            div.appendChild(img);
            div.appendChild(btn);
            itemList.appendChild(div);
        });
    });
}

// ---------------- МОДАЛКА ----------------

function openModal(key) {
    const item = currentData[key];

    // захист від бага
    if (!item || !item.image) return;

    modalDetails.innerHTML = `
        <img src="${item.image}">
        ${item.comment ? `<p>${item.comment}</p>` : ""}
    `;

    modal.classList.remove("hidden");
}

// закрити кнопкою
document.querySelector(".close-modal").onclick = () => {
    modal.classList.add("hidden");
};

// закрити кліком поза
modal.onclick = (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
};

// ---------------- ВИДАЛЕННЯ ----------------

function deleteItem(key) {
    remove(ref(db, `wishlists/${currentUser}/${key}`));
}

// старт
modal.classList.add("hidden");
loadData();
