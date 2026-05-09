const resultDisplay = document.getElementById("resultDisplay");
const themeToggle = document.getElementById("themeToggle");
const timeDisplay = document.getElementById("timeDisplay");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const STORAGE_KEY = "modernCalculatorHistory";
const THEME_KEY = "modernCalculatorTheme";
let expression = "";
let history = [];

function updateDisplay() {
  resultDisplay.textContent = expression || "0";
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
  themeToggle.textContent = document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
}

function saveTheme() {
  const theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem(THEME_KEY, theme);
}

function loadHistory() {
  const savedHistory = localStorage.getItem(STORAGE_KEY);
  history = savedHistory ? JSON.parse(savedHistory) : [];
  renderHistory();
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function renderHistory() {
  if (!history.length) {
    historyList.innerHTML = `<div class="history-empty">No history yet. Calculate something to save it.</div>`;
    return;
  }
  historyList.innerHTML = history
    .map(
      (item) =>
        `<div class="history-item">
          <div class="history-expression">${item.expression}</div>
          <div class="history-result">= ${item.result}</div>
          <div class="history-time">${item.time}</div>
        </div>`
    )
    .join("");
}

function addHistoryItem(expressionText, resultText) {
  if (!expressionText) return;
  history.unshift({
    expression: expressionText,
    result: resultText,
    time: new Date().toLocaleTimeString(),
  });
  if (history.length > 10) {
    history.pop();
  }
  saveHistory();
  renderHistory();
}

function clearHistory() {
  history = [];
  saveHistory();
  renderHistory();
}

function safeEvaluate(expr) {
  try {
    const sanitized = expr.replace(/[^0-9.+\-*/()%]/g, "");
    const result = Function(`"use strict"; return (${sanitized})`)();
    return Number.isFinite(result) ? result : "Error";
  } catch (e) {
    return "Error";
  }
}

function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
  saveTheme();
}

function handleButtonClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const value = button.dataset.value;
  const action = button.dataset.action;

  switch (action) {
    case "clear":
      expression = "";
      break;
    case "delete":
      expression = expression.slice(0, -1);
      break;
    case "equals": {
      const result = String(safeEvaluate(expression));
      addHistoryItem(expression, result);
      expression = result;
      break;
    }
    case "percent":
      expression = expression ? `${expression}/100` : "";
      break;
    default:
      if (value) {
        if (value === "." && expression.slice(-1) === ".") return;
        expression += value;
      }
  }
  updateDisplay();
}

loadTheme();
loadHistory();
updateDisplay();
updateTime();
setInterval(updateTime, 1000);

document.querySelector(".button-grid").addEventListener("click", handleButtonClick);
themeToggle.addEventListener("click", toggleTheme);
clearHistoryBtn.addEventListener("click", clearHistory);
