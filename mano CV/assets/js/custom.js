document.addEventListener("DOMContentLoaded", () => {

  // ===================== ELEMENTAI =====================
  const form = document.getElementById("contactForm");
  const msgBox = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");

  const fields = {
    vardas: document.getElementById("vardas"),
    pavarde: document.getElementById("pavarde"),
    email: document.getElementById("email"),
    tel: document.getElementById("tel"),
    adresas: document.getElementById("adresas"),
    r1: document.getElementById("rating1"),
    r2: document.getElementById("rating2"),
    r3: document.getElementById("rating3"),
    zinute: document.getElementById("message")
  };

  const outputDiv = document.createElement("div");
  outputDiv.id = "jsOutput";
  outputDiv.classList.add("mt-4", "p-3", "border", "rounded");
  form.after(outputDiv);

  // ===================== RANGE VALUE KLAUSIMAMS =====================
  ["rating1", "rating2", "rating3"].forEach(id => {
    document.getElementById(id).addEventListener("input", validateForm);
  });

  // ===================== KLAIDŲ RODYMAS =====================
  function setError(input, text) {
    let err = input.parentElement.querySelector(".error-text");

    if (!err && text) {
      err = document.createElement("div");
      err.className = "error-text";
      input.parentElement.appendChild(err);
    }

    if (text) {
      err.textContent = text;
      input.classList.add("input-error");
    } else {
      if (err) err.remove();
      input.classList.remove("input-error");
    }
  }

  function validateField(input) {
    const v = input.value.trim();
    let error = "";

    switch (input.id) {
      case "vardas":
      case "pavarde":
        if (!v) error = "Laukas privalomas.";
        else if (!/^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž -]+$/.test(v)) error = "Turi būti tik raidės.";
        break;

      case "email":
        if (!v) error = "Laukas privalomas.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) error = "Neteisingas el. paštas.";
        break;

      case "adresas":
        if (!v) error = "Laukas privalomas.";
        break;
    }

    setError(input, error);
    return !error;
  }

  // Validacija teksto laukams
  ["vardas", "pavarde", "email", "adresas"].forEach(id => {
    fields[id].addEventListener("input", () => {
      validateField(fields[id]);
      validateForm();
    });
  });

  function validateForm() {
    const ok = validateField(fields.vardas) &&
               validateField(fields.pavarde) &&
               validateField(fields.email) &&
               validateField(fields.adresas);

    submitBtn.disabled = !ok;
    return ok;
  }

  // ===================== TELEFONO FORMATAS =====================
  fields.tel.addEventListener("input", () => {
    let digits = fields.tel.value.replace(/\D/g, "");

    if (digits.startsWith("8")) digits = "370" + digits.slice(1);
    if (!digits.startsWith("370")) digits = "370" + digits;
    digits = digits.slice(0, 11);

    let formatted = "+";
    if (digits.length > 0) formatted += digits.slice(0, 3);
    if (digits.length > 3) formatted += " " + digits.slice(3, 4);
    if (digits.length > 4) formatted += digits.slice(4, 7);
    if (digits.length > 7) formatted += " " + digits.slice(7);

    fields.tel.value = formatted;
  });

  // ===================== SUBMIT =====================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showMsg("Pataisykite klaidas formoje.", false);
      return;
    }

    const data = {
      vardas: fields.vardas.value.trim(),
      pavarde: fields.pavarde.value.trim(),
      email: fields.email.value.trim(),
      tel: fields.tel.value.trim(),
      adresas: fields.adresas.value.trim(),
      r1: Number(fields.r1.value),
      r2: Number(fields.r2.value),
      r3: Number(fields.r3.value)
    };

    // ===================== KONSOLE =====================
    console.log("Gauti duomenys:", data);

    // ===================== VIDURKIS =====================
    const avg = ((data.r1 + data.r2 + data.r3) / 3).toFixed(1);

    console.log(`Vidurkis: ${avg}`);

    // ===================== ATVAIZDAVIMAS PO FORMA =====================
    outputDiv.innerHTML = `
      <strong>Gauti duomenys:</strong><br>
      Vardas: ${data.vardas}<br>
      Pavardė: ${data.pavarde}<br>
      El. paštas: ${data.email}<br>
      Tel. numeris: ${data.tel}<br>
      Adresas: ${data.adresas}<br>
      <strong>Vidurkis: ${avg}</strong>
    `;

    showMsg("Duomenys pateikti sėkmingai!", true);
  });

  function showMsg(text, ok) {
    msgBox.textContent = text;
    msgBox.className = ok ? "success" : "error";
  }

});
// ======================= ATMINTIES ŽAIDIMAS =======================

// Kortelių piktogramos (6+ unik., reikalavimas)
const icons = ["🍎","🍇","🍉","🍓","🍒","🥝","🍌","🍍"];

// Kintamieji
let moves, matches, time, timer, totalPairs;
let firstCard = null, lockBoard = false;

// Nuskaitymas iš DOM
const board = document.getElementById("gameBoard");
const bestDisplay = document.getElementById("best");

// Mygtukai
document.getElementById("startGame").addEventListener("click", startGame);
document.getElementById("resetGame").addEventListener("click", startGame);

// Paleidimas
function startGame() {
  resetStats();
  const diff = parseInt(document.getElementById("difficulty").value);
  totalPairs = (diff * 3) / 2;
  generateBoard(diff);
  startTimer();
  showBestScore(diff);
}

// Lentos generavimas
function generateBoard(cols) {
  let arr = icons.slice(0, totalPairs);
  arr = [...arr, ...arr].sort(() => Math.random() - 0.5);

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  arr.forEach(icon => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.value = icon;
    card.innerHTML = `<span class="hidden">${icon}</span>`;
    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });
}

// Kortelių apvertimas
function flipCard() {
  if (lockBoard || this.classList.contains("matched") || this === firstCard) return;

  this.querySelector("span").classList.remove("hidden");
  this.classList.add("flipped");

  if (!firstCard) { firstCard = this; return; }

  moves++; document.getElementById("moves").textContent = moves;

  if (this.dataset.value === firstCard.dataset.value) {
    matchFound(this, firstCard);
  } else {
    noMatch(this, firstCard);
  }
  firstCard = null;
}

// Surasta pora
function matchFound(c1, c2) {
  c1.classList.add("matched");
  c2.classList.add("matched");
  matches++;
  document.getElementById("matches").textContent = matches;
  if (matches === totalPairs) finishGame();
}

// Nesutampa
function noMatch(c1, c2) {
  lockBoard = true;
  setTimeout(() => {
    [c1, c2].forEach(c => {
      c.querySelector("span").classList.add("hidden");
      c.classList.remove("flipped");
    });
    lockBoard = false;
  }, 1000);
}

// Laikmatis
function startTimer() {
  time = 0;
  clearInterval(timer);
  timer = setInterval(() => {
    time++;
    document.getElementById("time").textContent = `${time}s`;
  }, 1000);
}

// Laimėjimas
function finishGame() {
  clearInterval(timer);
  document.getElementById("winMessage").style.display = "block";

  const diff = document.getElementById("difficulty").value;
  const best = localStorage.getItem(`best_${diff}`);

  if (best === null || moves < best) {
    localStorage.setItem(`best_${diff}`, moves);
    showBestScore(diff);
  }
}

// Reset rodikliams
function resetStats() {
  moves = matches = 0;
  document.getElementById("moves").textContent = 0;
  document.getElementById("matches").textContent = 0;
  document.getElementById("winMessage").style.display = "none";
  document.getElementById("time").textContent = "0s";
  clearInterval(timer);
}

// Iš localStorage geriausi rezultatai
function showBestScore(diff) {
  const best = localStorage.getItem(`best_${diff}`);
  bestDisplay.textContent = best ? best : "-";
}
