var peticionHttp = new XMLHttpRequest();

var tr;
window.onload = iniciar;

function iniciar() {
    document.getElementById("btnCerrar").addEventListener("click", cerrar);
    document.getElementById("btnModificar").addEventListener("click", modificar);
    document.getElementById("btnEliminar").addEventListener("click", eliminar);
    btnEliminar;
    ObtenerMaterias();
}

function PeticionGET(url, metodo, funcion) {
    abrirLoading();
    peticionHttp.onreadystatechange = funcion;
    peticionHttp.open(metodo, url, true);

    peticionHttp.send();
}


function respuestaModificar() {
    if (peticionHttp.readyState == 4) {
        if (JSON.parse(peticionHttp.responseText).type == "ok") {
            console.log("Materia modificada correctamente");
            ModificarTabla();
        }
        else {
            console.log("Error");
        }
        cerrarLoading();
    }
}

function ObtenerMaterias() {
    PeticionGET("http://localhost:3000/materias", "GET", RespuestaTabla);
}

function ModificarMateria() {
    PeticionPOST("http://localhost:3000/editar", "POST", respuestaModificar);
}

function ModificarTabla() {
    tr.childNodes[0].textContent = document.getElementById("nombre").value;
    tr.childNodes[2].textContent = CambiarFormatoFechaFinal(document.getElementById("fechaFinal").value);
    tr.childNodes[3].textContent = document.getElementById("noche").checked ? "Noche" : "Mañana";
    cerrar();
}



function PeticionPOST(url, metodo, funcion) {
    abrirLoading();
    peticionHttp.onreadystatechange = funcion;
    peticionHttp.open(metodo, url, true);
    peticionHttp.setRequestHeader("Content-Type", "application/json");

    var json = {
        "id": tr.getAttribute("id"),
        "nombre": document.getElementById("nombre").value,
        "cuatrimestre": tr.childNodes[1].textContent,
        "fechaFinal": CambiarFormatoFechaFinal(document.getElementById("fechaFinal").value),
        "turno": document.getElementById("noche").checked ? "Noche" : "Mañana"
    }
    peticionHttp.send(JSON.stringify(json));
}

function RespuestaTabla() {
    if (peticionHttp.readyState == 4) {
        if (peticionHttp.status == 200) {
            LlenarTabla(peticionHttp.responseText);
        }
        cerrarLoading();
    }
}

function LlenarTabla(materias) {
    var tCuerpo = document.getElementById("tCuerpo");

    var materias = JSON.parse(materias);

    materias.forEach(materia => {
        var tr = document.createElement("tr");

        tr.setAttribute("id", materia.id);

        var td1 = document.createElement("td");
        var nodoTexto1 = document.createTextNode(materia.nombre);
        td1.appendChild(nodoTexto1);
        tr.appendChild(td1);

        var td2 = document.createElement("td");
        var nodoTexto2 = document.createTextNode(materia.cuatrimestre);
        td2.appendChild(nodoTexto2);
        tr.appendChild(td2);

        var td3 = document.createElement("td");
        var nodoTexto3 = document.createTextNode(materia.fechaFinal);
        td3.appendChild(nodoTexto3);
        tr.appendChild(td3);

        var td4 = document.createElement("td");
        var nodoTexto4 = document.createTextNode(materia.turno);
        td4.appendChild(nodoTexto4);
        tr.appendChild(td4);

        tr.addEventListener("dblclick", ClickMateria);

        tCuerpo.appendChild(tr);
    });
}

function abrirLoading() {
    document.getElementById("loading").hidden = false;
    document.getElementById("contenedorModificar").hidden = true;
}

function cerrarLoading() {
    document.getElementById("loading").hidden = true;
}

function eliminar() {
    abrirLoading();
    peticionHttp.onreadystatechange = function () {

        if (peticionHttp.readyState == 4) {
            if (JSON.parse(peticionHttp.responseText).type == "ok") {
                console.log("Eliminado correctamente");
                tr.remove();
            }
            else {
                console.log("Error al eliminar");
            }
            cerrarLoading();
        }

    }
    peticionHttp.open("POST", "http://localhost:3000/eliminar", true);
    peticionHttp.setRequestHeader("Content-Type", "application/json");

    var json = {
        "id": tr.getAttribute("id"),
    }
    peticionHttp.send(JSON.stringify(json));

    cerrar();
}

function modificar() {
    if (ValidarDatos()) {
        ModificarMateria();
    }
}

function ClickMateria(e) {
    document.getElementById("contenedorModificar").hidden = false;
    tr = e.target.parentNode;
    document.getElementById("nombre").value = tr.childNodes[0].textContent;
    document.getElementById("fechaFinal").value = CambiarFormateFecha(tr.childNodes[2].textContent);
    if (tr.childNodes[3].textContent == "Noche") {
        document.getElementById("noche").checked = true;
    }
    else {
        document.getElementById("manana").checked = true;
    }
    console.log(tr.childNodes[1].textContent);
    switch (tr.childNodes[1].textContent) {
        case "1":
            document.getElementById("cuatrimestre").value = "1";
            break;
        case "2":
            document.getElementById("cuatrimestre").value = "2";
            break;
        case "3":
            document.getElementById("cuatrimestre").value = "3";
            break;
        case "4":
            document.getElementById("cuatrimestre").value = "4";
            break;
    }
    document.getElementById("cuatrimestre").setAttribute("disabled", "disabled");
}

function cerrar() {
    document.getElementById("nombre").value = "";
    document.getElementById("nombre").className = "bien";
    document.getElementById("fechaFinal").className = "bien";
    document.getElementById("contenedorModificar").hidden = true;
}

function ValidarDatos() {
    var retorno = true;
    var nombre = document.getElementById("nombre");
    var fecha = document.getElementById("fechaFinal");
    var fechaObj = new Date(fecha.value);
    if (nombre.value == "" || nombre.value.length <= 6) {
        nombre.className = "error";
        retorno = false;
    }
    else {
        nombre.className = "bien";
    }
    if (fecha.value == "" || fechaObj.getTime() < Date.now()) {
        fecha.className = "error";
        retorno = false;
    }
    else {
        fecha.className = "bien";
    }

    return retorno;

}

function CambiarFormateFecha(fecha) {
    var fechaArray = fecha.split("/");

    return fechaArray[2] + "-" + fechaArray[1] + "-" + fechaArray[0];
}

function CambiarFormatoFechaFinal(fecha) {
    var fechaArray = fecha.split("-");

    return fechaArray[2] + "/" + fechaArray[1] + "/" + fechaArray[0];
}