let express = require("express")
let mongodb = require("mongodb")
let sanitizeHTML = require("sanitize-html")

let toDoApp = express()
toDoApp.use(express.json())
toDoApp.use(express.static("Browser"))
toDoApp.use(express.urlencoded({extended: false}))

const connectionString = "mongodb+srv://toDoAdmin:Xc%5F12345@cluster0-stx5t.mongodb.net/dbToDo?retryWrites=true&w=majority"

let port = process.env.PORT
if ((port == "") || (port == null)) {
    port = 3000
}

let db
mongodb.connect(connectionString, {useUnifiedTopology: true}, function(err, client) {
    db = client.db()
    toDoApp.listen(port)
})

function PasswordProtect(req, res, next) {
    res.set('WWW-Authenticate', 'Basic realm="ToDoAppv2"')
    console.log(req.headers.authorization)
    if (req.headers.authorization == "Basic cGFyaTpwYXJp") {
        next()
    }
    else {
        res.status(401).send("Authorization needed. Please login.")
    }
}

toDoApp.use(PasswordProtect)

// home
toDoApp.get('/', function(req, res) {
    db.collection('colToDo').find().toArray(function(err, tasks) {
        res.send(`  <!DOCTYPE html>
                    <html>
                        <head>
                            <title>To-Do App</title>
                            <link rel="stylesheet" type="text/css" href="Style.css"/>
                        </head>
                        <body>
                            <div class="addDiv">
                                <h1 class="hdrH1">To-Do App</h1>
                                <form action="/add-task" method="POST" id="frmAddTask">
                                    <input type="text" name="edtNewTask" id="edtNewTask" autocomplete="off" placeholder="Enter the task..."/>
                                    <button type="submit" id="btnNewTask">ADD Task</button>
                                </form>
                            </div>
                            <div class="tasksDiv" id="tasksDiv">
                            </div>
                            <script>let lstTasks = ${JSON.stringify(tasks)}</script>
                            <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
                            <script src="/Browser.js"></script>                        
                        </body>
                    </html>
                `)
    })
})  

toDoApp.post('/add-task', function(req, res) {
    if (req.body.task) {
        let safeText = sanitizeHTML(req.body.task, {allowedTags: [], allowedAttributes: []})
        db.collection('colToDo').insertOne({task: safeText}, function(err, info) {
            res.json(info.ops[0]) // sends back the inserted object
        })
    }
})

toDoApp.post('/delete-task', function(req, res) {
    db.collection('colToDo').deleteOne({_id: new mongodb.ObjectID(req.body.id)}, function() {
        res.send("deleted")
    })
})

toDoApp.post('/edit-task', function(req, res) {
    let safeText = sanitizeHTML(req.body.task, {allowedTags: [], allowedAttributes: []})
    db.collection('colToDo').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.id)}, {set: {name: safeText}}, function() {
        res.send("updated")
    })
})