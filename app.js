const frmTasks = document.querySelector('#frmTasks');
const inputTask = document.querySelector('#task');
const contentList = document.querySelector('#contentList');
const btnOk = document.querySelector('#btnOk');
const btnCancel = document.querySelector('#btnCancel');

// let tasksList = [];

const state = {
    tasksList: []
};


document.addEventListener('DOMContentLoaded', () => {
    frmTasks.addEventListener('submit', newTask);
    btnCancel.addEventListener('click', cancelDestroy);
    btnOk.addEventListener('click', approveDestroy)
    const tasks = localStorage.getItem('tasks');
    if ( tasks ) {
        state.tasksList = JSON.parse(tasks);
        printHtml();
    }
});

// Add new Task
function newTask(e) {
    e.preventDefault();
    const task = inputTask.value.trim();
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s!¡¿?.,']+$/u;
    const maxLength = 100;

    if (task.length === 0) {
        showAlert('The task cannot go empty', 'error');
        return;
    }
    if (!regex.test(task)) {
        showAlert('Illegal characters were detected', 'error');
        return;
    }
    if (task.length > maxLength) {
        showAlert(`Permission exceeded ${maxLength} characters`, 'error');
        return;
    }
    if (state.tasksList.some(t => t.task === task)) {
        showAlert('The task already exists', 'error');
        return;
    }

    const tasksObj = { task, id: Date.now(), completed: false }
    state.tasksList = [...state.tasksList, tasksObj];

    showAlert('Taks added successfully', 'success');
    frmTasks.reset();
    printHtml();
    saveTaskToLocalStorage();
}

// Save task to local storage
function saveTaskToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(state.tasksList));
}

// Print the html
function printHtml() {
    cleanHtml();
    if (state.tasksList.length === 0) {
        const liTask = document.createElement('li');
        liTask.classList.add('no-task')
        const pMsg = document.createElement('p');
        pMsg.textContent = 'You don\'t have any added tasks yet ...';
        liTask.append(pMsg);
        contentList.appendChild(liTask);
    } else {
        state.tasksList.forEach(tasks => {
            const { id, task, completed } = tasks;
            const liTask = document.createElement('li');
            liTask.id = 'listCompleted';

            const divTask = document.createElement('div');
            const pCheck = document.createElement('p');
            const spanCheck = document.createElement('span');
            spanCheck.classList.add('check');
            spanCheck.textContent = '✓';

            pCheck.append(spanCheck);

            const pTask = document.createElement('p');
            pTask.id = 'taskText';
            pTask.textContent = task;

            const divButton = document.createElement('div');
            divButton.classList.add('buttons');

            const btnCheck = document.createElement('button');
            btnCheck.textContent = '✓';
            btnCheck.type = 'button';
            btnCheck.title = 'Completed Task';
            btnCheck.onclick = (e) => completedTask(e, id);

            const btnDelete = document.createElement('button');
            btnDelete.type = 'button';
            btnDelete.textContent = 'x';
            btnDelete.title = 'Delete Task';
            btnDelete.onclick = () => deleteTask(id);

            divButton.append(btnCheck);
            divButton.append(btnDelete);

            divTask.append(pCheck);
            divTask.append(pTask);

            liTask.append(divTask);
            liTask.append(divButton);

            contentList.appendChild(liTask);

            updateTaskStyle(liTask, completed);
        });
    }
}

// Delete a Task
function deleteTask(taskId) {
    document.querySelector('#showModal').style.display = 'grid';
    btnOk.dataset.taskid = taskId;
}

// Calcel deletion
function cancelDestroy() {
    const modal = document.querySelector('#showModal');
    if ( modal ) {
        modal.style.display = 'none';
    }
    btnOk.removeAttribute('data-taskid');
}

// aproved deletion
function approveDestroy() {
    const taskId = parseInt(btnOk.dataset.taskid, 10);
    state.tasksList = state.tasksList.filter(task => task.id !== taskId);
    showAlert('Task deleted successfully', 'success');
    document.querySelector('#showModal').style.display = 'none';
    saveTaskToLocalStorage();
    printHtml();
}

// Mark as task completed
function completedTask(e, taskId) {
    const taskItem = e.target.closest('li');
    if ( !taskItem ) return;

    // Find the specific task in tasksList 
    const taskIndex = state.tasksList.findIndex(t => t.id === taskId);
    if ( taskIndex === -1 ) return;

    // Store previous state for reference
    const wasCompleted = state.tasksList[taskIndex].completed;
    // Completed status toggle and style update
    state.tasksList[taskIndex].completed = !wasCompleted;

    updateTaskStyle(taskItem, state.tasksList[taskIndex].completed, wasCompleted, true);

    saveTaskToLocalStorage();
}

function updateTaskStyle(taskItem, completed, wasCompleted, userAction = false) {
    const pTask = taskItem.querySelector('#taskText');
    const spanCheck = taskItem.querySelector('.check');

    // verify that the task is completed;
    if (completed) {
        // Mark as completed
        taskItem.style.backgroundColor = '#6b6b6b';
        pTask.style.textDecoration = 'line-through';
        pTask.style.color = '#b2b2b2';
        spanCheck.style.display = 'inline';
        if ( userAction ) {
            showAlert('The task was marked as completed', 'success');
        }
    } else {
        if ( userAction ) {
            showAlert('The task marked as not completed', 'success');
        }
        // revert to not completed
        taskItem.style.backgroundColor = '#3b82f6';
        pTask.style.textDecoration = 'none';
        pTask.style.color = '#ffffff';
        spanCheck.style.display = 'none';
    }
}

// Clean the HTML
function cleanHtml() {
    while (contentList.firstChild) {
        contentList.removeChild(contentList.firstChild);
    }
}

// Show a alert
function showAlert(message, type) {
    const notRepeatAlert = document.querySelector('.alert');
    if (notRepeatAlert) notRepeatAlert.remove();
    const div = document.createElement('DIV');
    div.classList.add('alert', type);
    div.textContent = message;

    document.body.appendChild(div);
    setTimeout(() => div.remove(), 6000);
}