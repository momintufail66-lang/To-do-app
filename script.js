const defaultData = [
  {
    id: 1,
    title: "Architect modular frontend app",
    category: "Frontend",
    date: "2026-12-01",
    prio: "High",
    status: "Active",
  },
  {
    id: 2,
    title: "Implement client-side routing",
    category: "Routing",
    date: "2026-11-20",
    prio: "Medium",
    status: "Completed",
  },
  {
    id: 3,
    title: "Deploy project to Vercel",
    category: "Deployment",
    date: "2026-12-01",
    prio: "High",
    status: "Active",
  },
];

let tasks = JSON.parse(localStorage.getItem("tufail_tasks")) || defaultData;
let route = "all";

const taskBody = document.getElementById("taskBody");
const searchInp = document.getElementById("searchInp");
const prioFilter = document.getElementById("prioFilter");
const modal = document.getElementById("modal");
const taskForm = document.getElementById("taskForm");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

function render() {
  localStorage.setItem("tufail_tasks", JSON.stringify(tasks));

  const done = tasks.filter((task) => task.status === "Completed").length;

  document.getElementById("totalNum").innerText = tasks.length;
  document.getElementById("activeNum").innerText = tasks.length - done;
  document.getElementById("doneNum").innerText = done;

  const query = searchInp.value.toLowerCase();
  const priority = prioFilter.value;

  const filteredTasks = tasks.filter((task) => {
    if (route === "active" && task.status !== "Active") return false;
    if (route === "completed" && task.status !== "Completed") return false;
    if (priority !== "All" && task.prio !== priority) return false;

    return (
      task.title.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)
    );
  });

  taskBody.innerHTML = filteredTasks
    .map(
      (task, index) => `
        <tr>
          <td>
            <div class="task-cell">
              <span class="num">${index + 1}</span>
              <strong class="${task.status === "Completed" ? "done" : ""}">${task.title}</strong>
            </div>
          </td>
          <td>${task.category}</td>
          <td>${task.date}</td>
          <td><span class="badge ${task.prio}">${task.prio}</span></td>
          <td><span class="badge ${task.status}">${task.status}</span></td>
          <td class="right">
            <button class="act-btn" onclick="toggleTask(${task.id})">${task.status === "Completed" ? "Undo" : "Done"}</button>
            <button class="act-btn" onclick="editTask(${task.id})">Edit</button>
            <button class="act-btn" onclick="delTask(${task.id})">Delete</button>
          </td>
        </tr>
      `,
    )
    .join("");
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (task) {
    task.status = task.status === "Completed" ? "Active" : "Completed";
  }

  render();
}

function delTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  render();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) return;

  document.getElementById("editId").value = task.id;
  document.getElementById("titleInp").value = task.title;
  document.getElementById("catInp").value = task.category;
  document.getElementById("dateInp").value = task.date;
  document.getElementById("prioInp").value = task.prio;
  document.getElementById("modalTitle").innerText = "Edit Task";

  modal.classList.remove("hide");
}

function setMenuState(isOpen) {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    sidebar.classList.remove("collapsed");
    sidebar.classList.toggle("open", isOpen);
    sidebarBackdrop.classList.toggle("show", isOpen);
  } else {
    sidebar.classList.remove("open");
    sidebar.classList.toggle("collapsed", !isOpen);
    sidebarBackdrop.classList.remove("show");
  }

  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

document.getElementById("addBtn").onclick = () => {
  taskForm.reset();
  document.getElementById("editId").value = "";
  document.getElementById("modalTitle").innerText = "Add Task";

  modal.classList.remove("hide");
};

document.getElementById("closeBtn").onclick = () => {
  modal.classList.add("hide");
};

taskForm.onsubmit = (event) => {
  event.preventDefault();

  const id = document.getElementById("editId").value;

  const taskData = {
    title: document.getElementById("titleInp").value.trim(),
    category: document.getElementById("catInp").value.trim(),
    date: document.getElementById("dateInp").value,
    prio: document.getElementById("prioInp").value,
  };

  if (id) {
    const task = tasks.find((item) => item.id === Number(id));

    if (task) {
      Object.assign(task, taskData);
    }
  } else {
    tasks.push({
      id: Date.now(),
      ...taskData,
      status: "Active",
    });
  }

  modal.classList.add("hide");
  render();
};

searchInp.oninput = render;
prioFilter.onchange = render;

menuToggle.onclick = () => {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const isOpen = isMobile
    ? sidebar.classList.contains("open")
    : !sidebar.classList.contains("collapsed");

  setMenuState(!isOpen);
};

sidebarBackdrop.onclick = () => {
  setMenuState(false);
};

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      setMenuState(false);
    }
  });
});

function updateRoute() {
  route = location.hash.replace("#", "") || "all";

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route);
  });

  document.getElementById("pageTitle").innerText =
    route === "active"
      ? "Pending Tasks"
      : route === "completed"
        ? "Completed"
        : "All Tasks";

  render();
}

window.addEventListener("hashchange", updateRoute);

window.addEventListener("resize", () => {
  setMenuState(!window.matchMedia("(max-width: 768px)").matches);
});

setMenuState(!window.matchMedia("(max-width: 768px)").matches);
updateRoute();
