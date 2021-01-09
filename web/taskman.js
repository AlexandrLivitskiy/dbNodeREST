let URI = 'taskMan';
let TASK_FIELDS = null;
let userInfo = {};

async function httpRequest(uri, type, json = null) {
    return new Promise(function (resolve, reject) {
        uri = encodeURI('http://abs171:8000/' + uri);
        let xhr = new XMLHttpRequest();
        xhr.open(type, uri, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        // xhr.onprogress = function(event) {
        // };
        xhr.send(json);
    });
}

async function addTask(task = {}) {
    await httpRequest("addTask", 'POST', JSON.stringify(task));
    await mainPage();
}

async function deleteTask(id) {
    await httpRequest("deleteTaskById/" + id, 'POST');
    await mainPage();
}

async function cloneTask(id) {
    let afterAdding = (res) => {
        newTaskPage(res);
    }
    let res = await httpRequest("getTaskById/" + id, 'GET');
    afterAdding(res);
}

async function showTask(id) {
    let task = await httpRequest("getTaskById/" + id, 'GET');
    taskPage(task);
}

async function updateTask(id) {
    let options = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        status: document.getElementById("status").value
    };
    await httpRequest("updateTaskById/" + id, 'POST', JSON.stringify(options));
    await mainPage();
}

async function closeTask(id) {
    let options = {
        status: "done"
    };
    await httpRequest("updateTaskById/" + id, 'POST', JSON.stringify(options));
    await mainPage();
}

async function reopenTask(id) {
    let options = {
        status: "open"
    };
    await httpRequest("updateTaskById/" + id, 'POST', JSON.stringify(options));
    await mainPage();
}

async function getTaskFields() {
    return await httpRequest("taskManFields", 'GET');
}

async function logIn() {
    let credentials = {
        login: document.getElementById("login").value,
        password: document.getElementById("password").value
    };
    userInfo = await httpRequest("logIn", 'POST', JSON.stringify(credentials));
    if (userInfo.error) {
        alert(userInfo.error);
    } else {
        await mainPage();
    }
}

async function signUp() {
    if (document.getElementById("password").value !== document.getElementById("confirmPassword").value) {
        alert("Passwords do not match!");
    } else {
        let credentials = {
            login: document.getElementById("login").value,
            password: document.getElementById("password").value
        };
        userInfo = await httpRequest("signUp", 'POST', JSON.stringify(credentials));
        if (userInfo.error) {
            alert(userInfo.error);
        } else {
            await mainPage();
        }
    }
}

async function mainPage() {
    if (!TASK_FIELDS) TASK_FIELDS = await getTaskFields();
    let page = "<h1>Tasks List</h1>";
    page += `<h2>User - ${userInfo.login}</h2>`;
    page += "<p><button class='button' onclick='newTaskPage()'>New task</button><button class='button' onclick='loginPage()'>Log Out</button></p>"
    page += "<table style=\"width:100%\"><tr>";
    let fields = TASK_FIELDS.filter(x => x.showForTasksTable === "true")
    for (let field of fields) {
        page += `<th>${field.title}</th>`;
    }
    page += "<th>Actions</th></tr>";
    let tasks = await httpRequest(URI, 'GET');
    for (let task of tasks) {
        page += "<tr>";
        for (let field of fields) {
            page += `<td>${await formatField(task, field.name)}</td>`;
        }
        page += `<td>${getActionButtons(task)}</td></tr>\n`;
    }
    page += "</table>"
    document.body.innerHTML = page;
}

function getActionButtons(task) {
    let buttons = `<button title="Delete" onClick="deleteTask('${task._id}')" style="color: crimson">X</button>`;
    buttons += `<button title="Clone" onClick="cloneTask('${task._id}')" style="color: green">C</button>`;
    buttons += `<button title="Show" onClick="showTask('${task._id}')" style="color: orange">S</button>`;
    buttons += task.status === "done" ? `<button title="Reopen" onClick="reopenTask('${task._id}')" style="color: dodgerblue">R</button>` :
        `<button title="Done" onClick="closeTask('${task._id}')" style="color: dodgerblue">D</button>`;
    return buttons;
}

async function formatField(task, field) {
    let value = task[field];
    if (field === "createdDate") value = await formatDate(value);
    return value;
}

async function formatDate(date) {
    return (new Date(date)).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

async function loginPage() {
    userInfo = {};
    let page = "<h1>Log In</h1>";
    page += `<p>
            <label>Login</label>
            <input type=\"text\" id=\"login\">
          </p>
          <p>
            <label>Password</label>
            <input type=\"password\" id=\"password\">
          </p>
          <p>
            <button class='button' onclick='signUpPage()'>Sign Up</button>
            <button class='button' onclick='logIn()'>Log In</button>
          </p>`
    document.body.innerHTML = page;
}

async function signUpPage() {
    let page = "<h1>Sign Up</h1>";
    page += `<p>
            <label>Login</label>
            <input type=\"text\" id=\"login\">
          </p>
          <p>
            <label>Password</label>
            <input type=\"password\" id=\"password\">
          </p>
          <p>
            <label>Confirm Password</label>
            <input type=\"password\" id=\"confirmPassword\">
          </p>
          <p>
            <button class='button' onclick='signUp()'>Sign Up</button>
            <button class='button' onclick='loginPage()'>Log In</button>
          </p>`
    document.body.innerHTML = page;
}

async function newTaskPage(task = {}) {
    let page = "<h1>New Task</h1>";
    page += `<h2>User - ${userInfo.login}</h2>`;
    page += `<p>
            <label>Task Name</label>
            <input type=\"text\" id=\"name\" value="${task.name || ""}" onchange=''>
          </p>
          <p>
            <label>Description</label>
            <textarea id=\"description\">${task.description || ""}</textarea>
          </p>
          <p>
            <button class='button' onclick='mainPage()'>Cancel</button>
            <button class='button' onclick='createTask()'>Create Task</button>
          </p>`
    document.body.innerHTML = page;
}

function createTask() {
    let task = {
        name: document.getElementById("name").value || "New Task",
        description: document.getElementById("description").value || "Default description",
        creator: userInfo.login
    };
    addTask(task);
}

async function taskPage(task = {}) {
    let page = `<h1 id="name">${task.name}</h1>`;
    page += `<h2>User - ${userInfo.login}</h2>`;
    page += `<p>
            <label>Status</label>
            <input type="text" id="status" value="${task.status}" onchange=''>
          </p>
          <p>
            <label>Description</label>
            <textarea id="description">${task.description || ""}</textarea>
          </p>
          <p>
            <label>Creator: ${task.creator} Created Date ${await formatDate(task.createdDate)}</label>
          </p>
          <p>
            <button class='button' onclick="mainPage()">Main page</button>
            <button class='button' onclick="updateTask('${task._id}')">Update</button>
          </p>`
    document.body.innerHTML = page;
}

loginPage();
