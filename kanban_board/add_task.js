const form = document.getElementById("to-do-form");
const input = document.getElementById("task-input");
const col = document.getElementById("to-do-tasks");

form.addEventListener("submit", (e) => {
    e.preventDefault();/*to prevent screen reload*/
    const new_task = input.value;

    if (!new_task){
        return;
    }

    const newTask = createTaskElement(new_task);

    col.appendChild(newTask);
    input.value = "";
});

function createTaskElement(taskText){
    const task = document.createElement("div");
    task.classList.add("task");
    task.setAttribute("draggable", "true");

    const taskInfo = document.createElement("p");
    taskInfo.innerText = taskText;
    task.appendChild(taskInfo);

    const editButton = document.createElement("button");
    editButton.innerText = "Edit";
    task.appendChild(editButton);

    const delButton = document.createElement("button");
    delButton.innerText = "Delete";
    task.appendChild(delButton);

    task.addEventListener("dragstart", () => {
        task.classList.add("while-dragging");
    });
    task.addEventListener("dragend", () => {
        task.classList.remove("while-dragging");
    });

    editButton.addEventListener("click", () => {
        const newText = prompt("Edit task:", taskInfo.innerText);
        if (newText) {/*if any text is entered*/
            taskInfo.innerText = newText;
        }
    });

    delButton.addEventListener("click", () => {
        if (confirm("Confirm deletion of task")){
            task.remove();
        }
    });

    return task;
}
