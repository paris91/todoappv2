function buildHTML_TaskList(t) {
  return `<div class="taskDiv">
          <h4 class="taskCaption">${t.task}</h4>
          <div class="taskDivButtons">
            <button data-id="${t._id}" class="btnDeleteTask">Delete</button>
            <button data-id="${t._id}" class="btnEditTask">Edit</button>
          </div>
          </div>`
}

// home
let lstTasksDiv = document.getElementById('tasksDiv')
lstTasksDiv.insertAdjacentHTML("beforeend", lstTasks.map(function(t) {
  return buildHTML_TaskList(t)
}).join(''))

// add
let edtNewTask = document.getElementById('edtNewTask')
document.getElementById('frmAddTask').addEventListener("submit", function(e) {
    e.preventDefault() 
    axios.post('/add-task', {task: edtNewTask.value}).then(function(response) {
        document.getElementById("tasksDiv").insertAdjacentHTML(
                "beforeend", buildHTML_TaskList(response.data))
        edtNewTask.value = ""
    }).catch(function() {
		// nothing
	})
}) 

document.addEventListener('click', function(e) {
  if (e.target.classList.contains("btnDeleteTask")) {
    axios.post('/delete-task', {id: e.target.getAttribute("data-id")}).then(function() {
      e.target.parentElement.parentElement.remove()
    }).catch(function() {
      // nothing
    })
  }
  else if (e.target.classList.contains("btnEditTask")) {
    let prmt = prompt("Edit Task: ", e.target.parentElement.parentElement.querySelector(".taskCaption").innerHTML)
    if (prmt) {
      axios.post('/edit-task', {task: prmt, id: e.target.getAttribute("data-id")}).then(function() {
        e.target.parentElement.parentElement.querySelector(".taskCaption").innerHTML = prmt
      }).catch(function() {
        // nothing
      })
    }
  }
})