const draggables = document.querySelectorAll(".task");
const droppables = document.querySelectorAll(".column");

draggables.forEach((task) => {
    task.addEventListener("dragstart", () => {
        task.classList.add("while-dragging");
    });
    task.addEventListener("dragend", () => {
        task.classList.remove("while-dragging");
    });
});

droppables.forEach((col) => {
    col.addEventListener("dragover", (e) => {
        e.preventDefault();

        const belowTask = insertAboveTask(col, e.clientY);/*e.clientY is the y pos of the cursor */
        const currTask = document.querySelector(".while-dragging");

        if (!belowTask){
            col.appendChild(currTask);
        }
        else {
            col.insertBefore(currTask, belowTask);
        }
    });

    col.addEventListener("dragend", () => {
        col.classList.remove("while-dragging");
    });
});
const insertAboveTask = (col, cursorY) => {
    const rest = col.querySelectorAll(".task:not(.while-dragging)");/*select all tasks that arent ebing dragged */

    let closestTask = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    rest.forEach((task) => {/*finding the location of insert for each task*/
        const {top} = task.getBoundingClientRect();/*to find the top of the task(y-pos)*/
        const offset = cursorY - top;
        if (offset < 0 && offset > closestOffset){
            closestOffset = offset;
            closestTask = task;
        }
    });
    return closestTask;
};
