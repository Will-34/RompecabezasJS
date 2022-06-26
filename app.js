const express = require('express');
const app = express();

const http=require('http');
const url = require('url');
const axios = require('axios').default;
const server=http.createServer(app);

const {Server} = require('socket.io');
const io = new Server(server);

let usernames={};
let sockets_nombres={};
let proyectos_modelos={};
let juegos={};
//const urlPiezas='http://getdataproject.com/rompecabezas/miniaturas';
 
io.on('connection', (socket) => { 
    console.log('un usuario se ha conectado');

    socket.on('disconnect', () => {
        let id=socket.id;
        let nombre=sockets_nombres[id];
        let users = usernames[nombre]; 
        
        if(users!=undefined && users[id]!=undefined){
            delete users[id];  
        }
        if(sockets_nombres[id]!=undefined){
            delete sockets_nombres[id];  
        } 
        //delete users[id];
        io.to("room"+nombre).emit("updateusers",users);
        console.log('un usuario se ha DESCONECTADO');
    });
    socket.on('chat', (msg) => {
        console.log('Mensaje: '+msg);
        io.emit('chat', msg);
    });
    socket.on('adduser', function(jsonUsuario){
        let usuario = JSON.parse(jsonUsuario);
        let username = usuario.user;
        let nombre = usuario.nombre;
        
        if(!usernames[nombre]){
            usernames[nombre]={};
        }
        let users = usernames[nombre];
        
        let roomId= "room"+nombre;
        socket.join(roomId);
		
		socket.username = username;

        users[socket.id] = {username:username, nombre:nombre};
        usernames[nombre]=users;
        sockets_nombres[socket.id]=nombre;
        io.to("room"+nombre).emit("updateusers",users);

	}); 
    socket.on('update_modelo', function(data){
        let modelo = data.modelo;
        let username= data.username;
        let nombre= data.nombre;
        // console.log(data);
        juegos[nombre]=modelo;
        io.to("room"+nombre).emit("update_modelo",{modelo:modelo,username:username}); 
        
	}); 
    
});

var engines = require('consolidate');
const { json } = require('express/lib/response');

app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html'); 
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    console.log(queryObject);
    const nombre = queryObject.nombre;
    const fila = queryObject.f;
    const columna = queryObject.c;
    const user = queryObject.user;

    if(juegos[nombre]==undefined){
        let piezas = [];
        for (let i = 0; i < fila; i++) {
            let cols = [];
            for (let j = 0; j < columna; j++) {
                //cols.push(-1);
                cols.push(-1);
            }
            piezas.push(cols);
        }
        let longitud = fila*columna;
        let elementos = [];
        for (let i = 0; i < longitud; i++) {
            elementos.push(i+1);
        }
        elementos.sort(e=> Math.random()-0.5);
        juegos[nombre]={
			nombre:nombre,
			usuarios:[user],
			fila:fila,
			columna:columna,
			piezas:piezas,
            elementos: elementos
		};
    }else{
        if(juegos[nombre].usuarios.indexOf(user)==-1){
            juegos[nombre].usuarios.push(user);
        }
        
    }
    console.log(juegos);
    let modelo = JSON.stringify(juegos[nombre]);

    res.render(`${__dirname}/cliente/index.html`,{nombre:nombre,fila:fila,columna:columna,user: user, modelo: modelo}); 
 
    
}); 

app.set('port', process.env.PORT || 4000);

server.listen(app.get('port'),() =>{
    console.log(`server is running in ${app.get('port')}`);
});
/*
server.listen(4000,()=>{
    console.log('server is running on port 4000');
});
*/
 