const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector(".task-count");
const remainingLabel = document.querySelector("#tasks-remaining");
const searchInput = document.querySelector("#search-input");
const taskDialog = document.querySelector("#task-dialog");
const taskForm = document.querySelector("#task-form");
const taskTitleInput = document.querySelector("#new-task-title");
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function updateTaskSummary() {
  const items = [...taskList.querySelectorAll(".task-item")];
  const remaining = items.filter((item) => !item.querySelector(".task-checkbox").checked).length;
  taskCount.textContent = remaining;
  remainingLabel.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`;
}

taskList.addEventListener("change", (event) => {
  if (!event.target.matches(".task-checkbox")) return;
  event.target.closest(".task-item").classList.toggle("is-complete", event.target.checked);
  updateTaskSummary();
});

document.querySelector("#add-task-button").addEventListener("click", () => {
  taskDialog.showModal();
  taskTitleInput.focus();
});

function closeTaskDialog() {
  taskDialog.close();
  taskForm.reset();
}

document.querySelector(".dialog-close").addEventListener("click", closeTaskDialog);
document.querySelector(".dialog-cancel").addEventListener("click", closeTaskDialog);

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) {
    taskTitleInput.focus();
    return;
  }
  const item = document.createElement("label");
  item.className = "task-item";
  item.dataset.searchable = title.toLowerCase();
  const checkbox = document.createElement("input");
  checkbox.className = "task-checkbox";
  checkbox.type = "checkbox";
  const customCheck = document.createElement("span");
  customCheck.className = "custom-check";
  customCheck.setAttribute("aria-hidden", "true");
  const copy = document.createElement("span");
  copy.className = "task-copy";
  const taskName = document.createElement("strong");
  taskName.textContent = title;
  const metadata = document.createElement("small");
  metadata.innerHTML = '<span class="task-dot dot-purple"></span>Personal <span class="task-divider">·</span> Today';
  copy.append(taskName, metadata);
  const priority = document.createElement("span");
  priority.className = "task-priority priority-medium";
  priority.textContent = "New";
  item.append(checkbox, customCheck, copy, priority);
  taskList.prepend(item);
  closeTaskDialog();
  updateTaskSummary();
  filterSearchResults();
  showToast("Task added. One step at a time!");
});

function filterSearchResults() {
  const query = searchInput.value.trim().toLowerCase();
  const searchableItems = document.querySelectorAll("[data-searchable]");
  let matches = 0;
  searchableItems.forEach((item) => {
    const visible = !query || item.dataset.searchable.includes(query);
    item.hidden = !visible;
    if (visible) matches++;
  });
  document.querySelector("#empty-search").hidden = !query || matches > 0;
}

searchInput.addEventListener("input", filterSearchResults);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape" && taskDialog.open) closeTaskDialog();
});

const chartData = {
  week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    points: [[0, 111], [75, 87], [150, 91], [225, 66], [300, 70], [375, 54], [450, 61], [525, 43], [600, 25]],
    total: "32.4",
    trend: "14.8%"
  },
  month: {
    labels: ["1–4", "5–8", "9–12", "13–16", "17–20", "21–24", "25–28"],
    points: [[0, 103], [75, 78], [150, 91], [225, 52], [300, 67], [375, 39], [450, 58], [525, 33], [600, 21]],
    total: "126.8",
    trend: "9.6%"
  },
  year: {
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    points: [[0, 126], [75, 101], [150, 110], [225, 75], [300, 86], [375, 55], [450, 65], [525, 36], [600, 18]],
    total: "1,248",
    trend: "18.2%"
  }
};

function makeSmoothPath(points) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M${point[0]} ${point[1]}`;
    const previous = points[index - 1];
    const middle = (previous[0] + point[0]) / 2;
    return `${path} C${middle} ${previous[1]} ${middle} ${point[1]} ${point[0]} ${point[1]}`;
  }, "");
}

function updateChart(range) {
  const { labels, points, total, trend } = chartData[range];
  const line = makeSmoothPath(points);
  document.querySelector(".chart-line").setAttribute("d", line);
  document.querySelector(".chart-area").setAttribute("d", `${line} L600 163 L0 163Z`);
  document.querySelector(".chart-points").innerHTML = points
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`)
    .join("");
  document.querySelector(".chart-summary > strong").innerHTML = `${total}<span> hrs</span>`;
  document.querySelector(".chart-trend").innerHTML = `↗ ${trend} <span>vs. last period</span>`;
  document.querySelector("#chart-labels").innerHTML = labels.map((label) => `<span>${label}</span>`).join("");
  document.querySelector("#activity-chart").setAttribute("aria-label", `Focus hours activity chart for ${range}`);
}

document.querySelector("#chart-range").addEventListener("change", (event) => updateChart(event.target.value));

const pageCopy = {
  Overview: "Here's what's happening with your work today.",
  "My projects": "A snapshot of the things you're bringing to life.",
  "My tasks": "Small steps make for big progress.",
  Calendar: "Make space for what matters most."
};
document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".nav-link.active").classList.remove("active");
    button.classList.add("active");
    const page = button.dataset.page;
    document.querySelector("#breadcrumb-page").textContent = page;
    document.querySelector(".welcome-subtitle").textContent = pageCopy[page];
    if (page === "My tasks") taskList.scrollIntoView({ behavior: "smooth", block: "center" });
    if (page === "My projects") document.querySelector(".projects-panel").scrollIntoView({ behavior: "smooth", block: "center" });
    if (page === "Calendar") showToast("Your upcoming tasks are ready in My tasks.");
    if (window.innerWidth <= 820) {
      document.querySelector("#sidebar").classList.remove("is-open");
      document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
    }
  });
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const isOpen = document.querySelector("#sidebar").classList.toggle("is-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

const themeToggle = document.querySelector(".theme-toggle");
themeToggle.addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark-mode");
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  try {
    window.localStorage.setItem("sakib-dashboard-theme", dark ? "dark" : "light");
  } catch (error) {
    showToast("Theme changed for this visit.");
  }
});

try {
  if (window.localStorage.getItem("sakib-dashboard-theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.setAttribute("aria-label", "Switch to light mode");
  }
} catch (error) {
  // Theme preferences are optional when browser storage is unavailable.
}

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.querySelector("#view-all-tasks").addEventListener("click", () => {
  document.querySelector('[data-page="My tasks"]').click();
});
document.querySelector("#view-all-projects").addEventListener("click", () => {
  document.querySelector('[data-page="My projects"]').click();
});

const date = new Date();
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric"
}).format(date).toUpperCase();
if (date.getHours() >= 12 && date.getHours() < 17) {
  document.querySelector("h1").innerHTML = 'Good afternoon, Sakib <span class="wave">✳</span>';
} else if (date.getHours() >= 17) {
  document.querySelector("h1").innerHTML = 'Good evening, Sakib <span class="wave">✳</span>';
}