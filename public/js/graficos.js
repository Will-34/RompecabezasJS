
var eventoimg = 0;
var cv, cx, objetos, objetoActual=null, objetoSelect = null;
var inicioX = 0, inicioY = 0;
var alto = ancho=70;
var altoDif =0;

var eventorel=0;
var numClickRel=0;
var eleA=null;
var eleB=null;

let ganaste=false;

let pieza_select=null;

function quitar_pieza(){
    console.log("entra quitar");
    
    if(modelo!=null){
        if(pieza_select!=null){
            let f= pieza_select.f;
            let c= pieza_select.c;
            modelo.piezas[f][c]=-1;
            pieza_select=null;
            actualizar_pintado();
            MostrarOcultarElementos();
            notificar_cambio_modelo();
        }
    }
}

$(document).ready(function(){
    objetos = [];
    cv = document.getElementById('lienzo');
    cx = cv.getContext('2d');
    //altoDif = $('#h-titulos').height()+ $('#elementos').height()+100-10;
    altoDif = $('#box-cabecera').height()+10;
    anchoDif = 10;

    cv.onmousedown = function(event) {
        let ele = $('.ele-select').data('ele');
        // console.log(ele);
        // console.log(event.clientX, event.clientY);
        let posx = event.clientX-anchoDif;
        let posy = event.clientY-altoDif;

        console.log("x:",posx," y:",posy);


        let columna_m= Math.trunc(posx/(ancho_tab/modelo.columna));
        let fila_m= Math.trunc(posy/(alto_tab/modelo.fila));
      
        let piezas = modelo.piezas;
        let elementos = modelo.elementos;
        let _f_ant=-1;
        let _c_ant=-1;
        if(pieza_select!=null){
            _f_ant= pieza_select.f;
            _c_ant= pieza_select.c;
            pieza_select=null;
        }
        
        if(ele!=undefined){
            // console.log('dentro del tablero');
            // console.log("f:",fila_m,"c:",columna_m);
            
            // con x,y calculas la posicion f,c
            if(piezas[fila_m][columna_m] == -1){
                piezas[fila_m][columna_m] = ele;
                actualizar_pintado();
                MostrarOcultarElementos();
                $('.ele-select').removeClass('ele-select');
                verificar_piezas_ordenada();
                notificar_cambio_modelo();
            }

        }else{ // tengo x,y -> seleccion una pieza del tablero
            // con x,y calculas la posicion f,c
            // si pieza >-1  pieza_select ={f:f, c:c}
            if(piezas[fila_m][columna_m]>-1){
                if(_f_ant!=fila_m || _c_ant!= columna_m){
                    pieza_select={}; 
                    pieza_select.f=fila_m;
                    pieza_select.c=columna_m;
                }
                actualizar_pintado();
                notificar_cambio_modelo();
            }
        }
        console.log(pieza_select);
        
        
    }
    cv.onmouseup = function(evet) {
        objetoActual = null;
    }


    
});

function notificar_cambio_modelo(){
    if(modelo!=null){
        socket.emit('update_modelo', {username:username,modelo:modelo, nombre:nombre_juego});
    }
}

function verificar_piezas_ordenada(){
    let juegoOrdenado=true;
    if(modelo!=null){
        let piezas = modelo.piezas;
        let filas = modelo.fila;
        let columnas = modelo.columna;
        let nro=1;
        for (let i = 0; i < filas; i++) {
            for (let j = 0; j < columnas; j++) {
                console.log('verif: ',piezas[i][j],nro )
                if(piezas[i][j]!=nro || piezas[i][j]==-1){
                    juegoOrdenado=false;
                    break;
                }
                nro++;
            }
        }
    }
    ganaste=juegoOrdenado;
    if(ganaste){
        let users = [];
        let lis= $('#list-users li span');
        for (let i = 0; i < lis.length; i++) {
            const span = lis[i];
            users.push($(span).text());
        }
        let str_users = users.join(', ');
        $('#box-botones').hide();
        $('#msg-ganaste').text(`Felicidades, Ganaste ${str_users}!!!`);
        $('#msg-ganaste').show();
    }
}

let img_elementos = {};

function actualizar_pintado() {
    if(modelo!=null){
        cx.fillStyle = '#fff';
        cx.fillRect(0, 0, cv.width, cv.height);
        let fila= modelo.fila;
        let columna= modelo.columna;
        let piezas = modelo.piezas;
        let alto = alto_tab/fila;
        let ancho = ancho_tab/columna;
        for (let i = 0; i < fila; i++) {
            for (let j = 0; j < columna; j++) {
                const ele = piezas[i][j];
                if(ele>-1){
                    let img = img_elementos[ele];
                    let posx=j*ancho;
                    let posy=i*alto;
                    if(img==undefined){
                        img = new Image();
                        img.src=url_base+'/'+modelo.nombre+'/'+ele+'.jpg'; 
                        img_elementos[ele] = img;
                        img.onload = function () {
                            cx.drawImage(img,posx, posy, ancho, alto);
                        }
                    }else{
                        cx.drawImage(img,posx,posy, ancho, alto);
                    }
                }
            }
        }
        cx.lineWidth = 0.5;
        cx.strokeStyle = "#dadada";
        cx.beginPath();
        for (let i = 0; i < fila; i++) {
            let posx=0;
            let posy=i*alto;
            let posxa = posx;
            let posya = posy;
            let posxb = ancho_tab;
            let posyb = posy;
            cx.beginPath();
            cx.moveTo(posxa, posya);
            cx.lineTo(posxb, posyb);
            cx.stroke();
        }
        for (let j = 0; j < columna; j++) {
            let posx=j*ancho;
            let posy=0;
            let posxa = posx;
            let posya = posy;
            let posxb = posxa;
            let posyb = alto_tab;
            cx.beginPath();
            cx.moveTo(posxa, posya);
            cx.lineTo(posxb, posyb);
            cx.stroke();
        }

        if(pieza_select!=null){
            //cx.fillStyle = '#0034d1';
            cx.lineWidth = 3;
            cx.strokeStyle = "#0034d1";
            let _posx= pieza_select.c*ancho;
            let _posy= pieza_select.f*alto;
            console.log('pintar select',_posx, _posy, ancho, alto);
            cx.strokeRect(_posx, _posy, ancho, alto);
        }

    }
}

