// Tab functionality
function openTab(tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    const tabButtons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");

    if (tabName === "tasks") {
    const usersTableBody = document.querySelector("#usersTable tbody");
            if (usersTableBody) usersTableBody.innerHTML = "";

            document.getElementById("userForm").reset();
            const modal = document.getElementById("editModal");
            if (modal) modal.style.display = "none";
        loadAllUsersForTasks();
        loadAllTasks();
    } else if (tabName === "users") {
        // Clear the tasks table when switching to users tab
        const tasksTableBody = document.querySelector("#tasksTable tbody");
        if (tasksTableBody) {
            tasksTableBody.innerHTML = "";
        }
        // Reset task filters
        document.getElementById("statusFilter").selectedIndex = 0;
        document.getElementById("userFilter").selectedIndex = 0;
         document.getElementById("taskForm").reset();
        // Load users
        loadAllUsers();
    }
}

// Modal functionality
const modal = document.getElementById("editModal");
const span = document.getElementsByClassName("close")[0];

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// API base URL
const API_BASE_URL = "http://localhost:8080/api";

// User Management
document.getElementById("userForm").addEventListener("submit", function(e) {
    e.preventDefault();
    createUser();
});

document.getElementById("editUserForm").addEventListener("submit", function(e) {
    e.preventDefault();
    updateUser();
});

function createUser() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            email,
            password
        })
    })
    .then(response => response.json())
    .then(data => {
        alert("User created successfully!");
        document.getElementById("userForm").reset();
        loadAllUsers();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error creating user");
    });
}

function loadAllUsers() {
    fetch(`${API_BASE_URL}/users`)
    .then(response => response.json())
    .then(users => {
        const tbody = document.querySelector("#usersTable tbody");
        tbody.innerHTML = "";

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.active ? "Active" : "Inactive"}</td>
                <td>
                    <button onclick="openEditModal(${user.id})">Edit</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    })
    .catch(error => console.error("Error:", error));
}

function loadActiveUsers() {
    fetch(`${API_BASE_URL}/users/active`)
    .then(response => response.json())
    .then(users => {
        const tbody = document.querySelector("#usersTable tbody");
        tbody.innerHTML = "";

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.active ? "Active" : "Inactive"}</td>
                <td>
                    <button onclick="openEditModal(${user.id})">Edit</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    })
    .catch(error => console.error("Error:", error));
}

function openEditModal(userId) {
    fetch(`${API_BASE_URL}/users/${userId}`)
    .then(response => response.json())
    .then(user => {
        document.getElementById("editUserId").value = user.id;
        document.getElementById("editUsername").value = user.username;
        document.getElementById("editEmail").value = user.email;
        document.getElementById("editActive").checked = user.active;

        modal.style.display = "block";
    })
    .catch(error => console.error("Error:", error));
}

function updateUser() {
    const userId = document.getElementById("editUserId").value;
    const username = document.getElementById("editUsername").value;
    const email = document.getElementById("editEmail").value;
    const active = document.getElementById("editActive").checked;

    fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            email,
            active
        })
    })
    .then(response => response.json())
    .then(data => {
        alert("User updated successfully!");
        modal.style.display = "none";
        loadAllUsers();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error updating user");
    });
}

function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        fetch(`${API_BASE_URL}/users/${userId}`, {
            method: "DELETE"
        })
        .then(response => {
            if (response.ok) {
                alert("User deleted successfully!");
                loadAllUsers();
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error deleting user");
        });
    }
}

// Task Management
document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault();
    createTask();
});

function loadAllUsersForTasks() {
    fetch(`${API_BASE_URL}/users`)
    .then(response => response.json())
    .then(users => {
        const taskUserSelect = document.getElementById("taskUser");
        const userFilterSelect = document.getElementById("userFilter");

        // Clear existing options except the first one
        taskUserSelect.innerHTML = "<option value=''>Unassigned</option>";
        userFilterSelect.innerHTML = "<option value=''>Filter by User</option>";

        users.forEach(user => {
            const option1 = document.createElement("option");
            option1.value = user.id;
            option1.textContent = user.username;
            taskUserSelect.appendChild(option1);

            const option2 = document.createElement("option");
            option2.value = user.id;
            option2.textContent = user.username;
            userFilterSelect.appendChild(option2);
        });
    })
    .catch(error => console.error("Error:", error));
}

function createTask() {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const status = document.getElementById("taskStatus").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const userId = document.getElementById("taskUser").value;
    const selectedIndex = document.getElementById("taskUser").selectedIndex;

    if (selectedIndex === 0) {
        alert("Please select a user.");
        return;
    }

    // First check if user is active
    fetch(`${API_BASE_URL}/users/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            return response.json();
        })
        .then(user => {
            if (!user.active) {
                throw new Error("Cannot assign task to inactive user");
            }

            // User is active, proceed with task creation
            const taskData = {
                title,
                description,
                status,
                dueDate,
                userId: parseInt(userId)
            };

            return fetch(`${API_BASE_URL}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(taskData)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to create task");
            }
            return response.json();
        })
        .then(data => {
            alert("Task created successfully!");
            document.getElementById("taskForm").reset();
            loadAllTasks();
        })
        .catch(error => {
            console.error("Error:", error);
            alert(error.message || "Error creating task");
        });
}

function loadAllTasks() {

    fetch(`${API_BASE_URL}/tasks`)
    .then(response => response.json())
    .then(tasks => {
        renderTasks(tasks);
    })
    .catch(error => console.error("Error:", error));
    loadTodayDate();
}

function filterTasksByStatus() {

     const statusFilter = document.getElementById("statusFilter");
        const selectedIndex = statusFilter.selectedIndex;
        const status = statusFilter.value;

        if (selectedIndex === 0 || !status) {
            loadAllTasks();
            return;
        }

    fetch(`${API_BASE_URL}/tasks?status=${status}`)
    .then(response => response.json())
    .then(tasks => {
        renderTasks(tasks);
    })
    .catch(error => console.error("Error:", error));
}

function filterTasksByUser() {
    const userFilter = document.getElementById("userFilter");
    const selectedIndex = userFilter.selectedIndex;
    const userId = userFilter.value;

    if (selectedIndex === 0 || !userId) {
        loadAllTasks();
        return;
    }
    fetch(`${API_BASE_URL}/tasks?userId=${userId}`)
        .then(response => response.json())
        .then(tasks => {
            renderTasks(tasks);
        })
        .catch(error => console.error("Error:", error));
}


function renderTasks(tasks) {
    const tbody = document.querySelector("#tasksTable tbody");
    tbody.innerHTML = "";

    tasks.forEach(task => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.description || ""}</td>
            <td>
                <select onchange="updateTaskStatus(${task.id}, this.value)">
                    <option value="PENDING" ${task.status === "PENDING" ? "selected" : ""}>Pending</option>
                    <option value="IN_PROGRESS" ${task.status === "IN_PROGRESS" ? "selected" : ""}>In Progress</option>
                    <option value="COMPLETED" ${task.status === "COMPLETED" ? "selected" : ""}>Completed</option>
                </select>
            </td>
            <td>${task.dueDate || ""}</td>
           <td>${task.username ? task.username : "Unassigned"}</td>
            <td>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function updateTaskStatus(taskId, status) {
    fetch(`${API_BASE_URL}/tasks/${taskId}/status?status=${status}`, {
        method: "PATCH"
    })
    .then(response => response.json())
    .then(data => {
        console.log("Task status updated");
    })
    .catch(error => console.error("Error:", error));
}

function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: "DELETE"
        })
        .then(response => {
            if (response.ok) {
                alert("Task deleted successfully!");
                loadAllTasks();
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error deleting task");
        });
    }
}
function checkUserFilter(selectElement) {
    if (selectElement.selectedIndex === 0) {
        loadAllUsers();
    }
}

function loadTodayDate() {
    const dateInput = document.getElementById("taskDueDate");
               if (dateInput) {
                   const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
                   dateInput.value = today;
               }
}
// Initialize
document.addEventListener("DOMContentLoaded", function() {
    loadAllUsers();
loadTodayDate();
});