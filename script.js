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

let user = "Іринка";
let data = {};
let unsubscribe = null;

// елементи
const form = document.getElementById("form");
const list = document.getElementById("list");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

// вкладки
document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    user = btn.dataset.user;
    load();
  };
});

// кнопки
addBtn.onclick = () => {
  form.classList.remove("hidden");
  list.classList.add("hidden");
};

viewBtn.onclick = () => {
  list.classList.remove("hidden");
  form.classList.add("hidden");
};

// додати
form.onsubmit = e => {
  e.preventDefault();

  const file = fileInput.files[0];
  const comment = commentInput.value;

  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    push(ref(db, "wishlists/" + user), {
      image: ev.target.result,
      comment
    });

    form.reset();
    form.classList.add("hidden");
  };

  reader.readAsDataURL(file);
};

// load
function load() {
  if (unsubscribe) unsubscribe();

  unsubscribe = onValue(ref(db, "wishlists/" + user), snap => {
    data = snap.val() || {};
    list.innerHTML = "";

    Object.keys(data).forEach(key => {
      const item = data[key];
      if (!item.image) return;

      const div = document.createElement("div");
      div.className = "item";

      const img = document.createElement("img");
      img.src = item.image;

      img.onclick = () => openModal(key);

      const del = document.createElement("button");
      del.textContent = "🗑";
      del.className = "delete";

      del.onclick = e => {
        e.stopPropagation();
        remove(ref(db, "wishlists/" + user + "/" + key));
      };

      div.append(img, del);
      list.append(div);
    });
  });
}

// модалка
function openModal(key) {
  const item = data[key];
  if (!item) return;

  modalContent.innerHTML = `
    <img src="${item.image}">
    ${item.comment ? `<p>${item.comment}</p>` : ""}
  `;

  modal.classList.add("active");
}

// закриття
close.onclick = () => modal.classList.remove("active");

modal.onclick = e => {
  if (e.target === modal) modal.classList.remove("active");
};

// старт
load();
