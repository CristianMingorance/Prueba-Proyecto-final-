const express = require("express")
const colors = require("colors")
const process = require("process")
const fs = require("fs")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const expressJWT = require("express-jwt")
var cors = require('cors')
//Create server, get port and load password for token signature
const server = express();
const port = process.argv[2];
const secrets = JSON.parse(fs.readFileSync("secrets.json"))
const path = require('path')

path.join(__dirname,'secrets.json')
//Middleware
server.use(cors())
server.use(bodyParser.json())
server.use(expressJWT({
    secret: secrets["jwt_clave"]
}).unless({
    path: ["/login", "/tecnicos", /^\/tecnicos\/.*/, "/tecnico", "/register"]
}))

//Endpoints

//REGISTRO DE NUEVO ADMINISTRADOR
server.post("/register", (req, res) => {
    //check body is correct
    if (req.body["usuario"] != undefined && req.body["usuario"] != "" && req.body["password"] != undefined && req.body["password"] != "") {
        //check if user is already registered
        fs.readFile("usuarios.json", (err, data) => {

            if (err) {
                console.log(err)
            }
            let usersData = JSON.parse(data);
            let userFound = false;
            for (let i = 0; i < usersData.length; i++) {
                if (usersData[i]["usuario"] == req.body["usuario"]) {
                    userFound = true;
                    console.log("User already exists".red)
                    res.send({
                        "message": "Error. There already exists a user with the same username. Please choose a different one"
                    })
                }
            }

            if (!userFound) {
                //Hash of the password
                bcrypt.hash(req.body["password"], 13, (err, hash) => {
                    usersData.push({
                        "usuario": req.body["usuario"],
                        "password": hash
                    })
                    fs.writeFile("usuarios.json", JSON.stringify(usersData), (err, data) => {
                        console.log("User registered".green)
                        res.send({
                            "message": "User registered correctly. You can log in now :)"
                        })
                    })
                })
            }
        })
    }
})


//LOGIN DE ADMINISTRADOR
server.post("/login", (req, res) => {
    //check if body is correct

    if (req.body["usuario"] != undefined && req.body["usuario"] != "") {
        //check if username exists
        fs.readFile("usuarios.json", (err, data) => {

            if (err) {
                console.log(err)
            }

            let usersData = JSON.parse(data);
            let userFound;

            for (let i = 0; i < usersData.length; i++) {
                if (usersData[i]["usuario"] == req.body["usuario"]) {
                    userFound = usersData[i];
                }
            }

            if (userFound != undefined) {
                //check if password is correct. compare hash with the one in the users.json file
                bcrypt.compare(req.body["password"], userFound["password"], (err, result) => {

                    if (!result) {
                        console.log("Password incorrect".red);
                        res.send({
                            "message": "Login incorrect"
                        })

                    } else {
                        //create token
                        jwt.sign({
                            "usuario": userFound["usuario"]
                        }, secrets["jwt_clave"], (err, token) => {
                            console.log("Login correct".green)
                            res.send({
                                "message": "Login correct",
                                "token": token
                            })
                        })
                    }

                })

            } else {
                console.log("Login incorrect".red)
                res.send({
                    "message": "Login incorrect"
                })
            }
        })

    } else {
        console.log("Login incorrect".red)
        res.send({
            "message": "Login incorrect"
        })
    }
})




//REGISTRO DE NUEVO TECNICO
server.post("/tecnico", (req, res) => {
    //check body is correct
    if (req.body["nombre"] != undefined && req.body["nombre"] != "" && req.body["password"] != undefined && req.body["password"] != "") {
        //check if user is already registered
        fs.readFile("tecnicos.json", (err, data) => {

            if (err) {
                console.log(err)
            }

            let usersData = JSON.parse(data);
            let userFound = false;

            for (let i = 0; i < usersData.length; i++) {
                if (usersData[i]["nombre"] == req.body["nombre"]) {
                    userFound = true;
                    console.log("User already exists".red)
                    res.send({
                        "message": "Error. There already exists a user with the same username. Please choose a different one"
                    })
                }
            }


            if (!userFound) {
                
                bcrypt.hash(req.body["password"], 13, (err, hash) => {
                    usersData.push({
                        "tecnicoID": req.body["tecnicoID"],
                        "nombre": req.body["nombre"],
                        "apellidos": req.body["apellidos"],
                        "direccion": req.body["direccion"],
                        "electrodomesticos": req.body["electrodomesticos"],
                        "password": hash
                    })

                    fs.writeFile("tecnicos.json", JSON.stringify(usersData), (err, data) => {
                        console.log("User registered".green)
                        res.send({
                            "message": "User registered correctly. You can log in now :)"
                        })
                    })
                })
            }
        })
    }
})

//MODIFICAR DATOS DE UN TECNICO 


server.put("/tecnico", (req, res) => {
    
    if (req.body["tecnicoID"] != undefined && req.body["tecnicoID"] != "") {
        
        fs.readFile("tecnicos.json", (err, data) => {

            if (err) {
                console.log(err)
            }

            let usersData = JSON.parse(data);
            let userFound;
            for (let i = 0; i < usersData.length; i++) {
                if (usersData[i]["tecnicoID"] == req.body["tecnicoID"]) {

                    console.log("ha entrado".red)
                    userFound = usersData[i];
                    usersData.splice(i, 1)
                }
            }

            if (userFound != undefined) {
                //Hash of the password
                bcrypt.hash(req.body["password"], 13, (err, hash) => {
                    let usuarioTecnico = {
                        "tecnicoID": req.body["tecnicoID"],
                        "nombre": req.body["nombre"],
                        "apellidos": req.body["apellidos"],
                        "direccion": req.body["direccion"],
                        "electrodomesticos": req.body["electrodomesticos"]
                    }

                    if (req.body["password"] != undefined) {
                        usuarioTecnico.password = hash;
                    } else {
                        usuarioTecnico.password = userFound.password
                    }

                    usersData.push(usuarioTecnico)
                    fs.writeFile("tecnicos.json", JSON.stringify(usersData), (err, data) => {
                        console.log("User update".green)
                        res.send({
                            "message": "User update correctly. You can log in now :)"
                        })
                    })
                })

            } else {
                res.send({
                    "message": "Usuario no existente"
                })
            }
        })

    } else {
        res.send({
            "message": "Usuario no existente"
        })

    }
})


//LISTA DE TODOS LOS TECNICOS
server.get("/tecnicos", (req, res) => {
    fs.readFile("tecnicos.json", (err, data) => {

        res.send(data)
    })
})

//TECNICO POR SU ID
server.get("/tecnicos/:id", (req, res) => {
    fs.readFile("tecnicos.json", (err, data) => {

        let tecnicosPars = JSON.parse(data)
        let tecnicoId = req.params.id
        let tecnicos = tecnicosPars.filter(function (tecnico) {

            return tecnico.tecnicoID == tecnicoId;

        });

        if (tecnicos.length == 0) {
            res.send({
                error: "Tecnico no existente"
            })
        } else {
            res.send(tecnicos[0])
        }
    })
})







server.get("/testAll", (req, res) => {
    res.send("All OK!")
})

if (!fs.existsSync("usuarios.json")) {
    fs.writeFileSync("usuarios.json", "[]");
}


server.listen(port, () => {
    console.log("Escuchando en puerto " + port)
});


//Deployar con AWS (Amazon Web Service) con el componente EC2