// ==================================================
// 1. Inisialisasi dan Event Listener
// ==================================================

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addTodo();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

// ==================================================
// 2. Data Management (CRUD Todo)
// ==================================================

const todos = [];
const RENDER_EVENT = 'render-todo';

function addTodo() {
    const textTodo = document.getElementById('title').value;
    const timestamp = document.getElementById('date').value;

    if (textTodo.trim() === "" || timestamp.trim() === "") {
        showNotification("Input tidak boleh kosong!");
        return;
    }

    const generatedID = generateId();
    const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false);
    todos.push(todoObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    showNotification("Todo berhasil ditambahkan!");
}

function editTask(todoId) {
    const todoTarget = findTodo(todoId);
    if (!todoTarget) return;

    // Isi popup dengan data Todo yang akan diedit
    document.getElementById('edit-title').value = todoTarget.task;
    document.getElementById('edit-date').value = todoTarget.timestamp;

    // Simpan ID Todo yang sedang diedit
    currentEditId = todoId;

    // Tampilkan popup
    document.getElementById('edit-popup').style.display = 'flex';
}

// Simpan perubahan edit
document.getElementById('save-edit').addEventListener('click', function () {
    if (currentEditId === null) return;

    const updatedTask = document.getElementById('edit-title').value.trim();
    const updatedDate = document.getElementById('edit-date').value.trim();

    if (updatedTask === "" || updatedDate === "") {
        showNotification("Input tidak boleh kosong!");
        return;
    }

    const todoTarget = findTodo(currentEditId);
    if (!todoTarget) return;

    // Perbarui data Todo
    todoTarget.task = updatedTask;
    todoTarget.timestamp = updatedDate;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    // Sembunyikan popup
    document.getElementById('edit-popup').style.display = 'none';
    showNotification("Todo berhasil diperbarui!");
});

// Batalkan edit
document.getElementById('cancel-edit').addEventListener('click', function () {
    document.getElementById('edit-popup').style.display = 'none';
    currentEditId = null;
});

// ==================================================
// 3. Fungsi Bantuan (Utility)
// ==================================================

function generateId() {
    return +new Date();
}

function generateTodoObject(id, task, timestamp, isCompleted) {
    return { id, task, timestamp, isCompleted };
}

function showNotification(message) {
    setTimeout(() => alert(message), 0);
}

// ==================================================
// 4. Rendering dan Manipulasi DOM
// ==================================================

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedTODOList = document.getElementById('todos');
    uncompletedTODOList.innerHTML = '';

    const completedTODOList = document.getElementById('completed-todos');
    completedTODOList.innerHTML = '';

    for (const todoItem of todos) {
        const todoElement = makeTodo(todoItem);
        if (!todoItem.isCompleted)
            uncompletedTODOList.append(todoElement);
        else
            completedTODOList.append(todoElement);
    }
});

function makeTodo(todoObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = todoObject.task;

    const textTimestamp = document.createElement('p');
    textTimestamp.innerText = todoObject.timestamp;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textTimestamp);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `todo-${todoObject.id}`);

    if (todoObject.isCompleted) {
        const undoButton = createButton('undo-button', function () {
            undoTaskFromCompleted(todoObject.id);
            showNotification("Todo dikembalikan ke daftar tugas!");
        });

        const trashButton = createButton('trash-button', function () {
            removeTaskFromCompleted(todoObject.id);
            showNotification("Todo telah dihapus!");
        });

        container.append(undoButton, trashButton);
    } else {
        const editButton = createButton('edit-button', function () {
            editTask(todoObject.id);
        });

        const checkButton = createButton('check-button', function () {
            addTaskToCompleted(todoObject.id);
            showNotification("Todo telah diselesaikan!");
        });

        container.append(editButton, checkButton);
    }

    return container;
}

function createButton(buttonClass, eventListener) {
    const button = document.createElement('button');
    button.classList.add(buttonClass);
    button.addEventListener('click', eventListener);
    return button;
}

// ==================================================
// 5. Fungsi untuk Mengelola Status Todo
// ==================================================

function addTaskToCompleted(todoId) {
    const todoTarget = findTodo(todoId);
    if (todoTarget == null) return;

    todoTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTaskFromCompleted(todoId) {
    const todoTarget = findTodoIndex(todoId);
    if (todoTarget === -1) return;

    todos.splice(todoTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTaskFromCompleted(todoId) {
    const todoTarget = findTodo(todoId);
    if (todoTarget == null) return;

    todoTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// ==================================================
// 6. Fungsi Pencarian dan Penyimpanan Data
// ==================================================

function findTodo(todoId) {
    return todos.find(todoItem => todoItem.id === todoId) || null;
}

function findTodoIndex(todoId) {
    return todos.findIndex(todoItem => todoItem.id === todoId);
}

function saveData() {
    if (isStorageExist()) {
        localStorage.setItem('TODO_APPS', JSON.stringify(todos));
        document.dispatchEvent(new Event('saved-todo'));
    }
}

function isStorageExist() {
    return typeof (Storage) !== undefined;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem('TODO_APPS');
    if (serializedData !== null) {
        todos.push(...JSON.parse(serializedData));
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}
