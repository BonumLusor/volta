"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OPs = [];
var MPs = [];
var itens = [];
var OPselected = -1;
var MPselected = [];
var stage = "OPs";
var OPselector = document.getElementById("OPselector");
var MPselector = document.getElementById("MPselector");
var OPsElement = document.getElementById("OPs");
var MPsElement = document.getElementById("MPs");
var CNVElement = document.getElementById("CNV");
// Verifica qual tela deve ser exibida
function update() {
    if (stage == "OPs") {
        OPsElement.classList.remove("hidden");
        MPsElement.classList.add("hidden");
        CNVElement.classList.add("hidden");
    }
    else if (stage == "MPs") {
        OPsElement.classList.add("hidden");
        MPsElement.classList.remove("hidden");
        CNVElement.classList.add("hidden");
    }
    else if (stage == "CNV") {
        OPsElement.classList.add("hidden");
        MPsElement.classList.add("hidden");
        CNVElement.classList.remove("hidden");
    }
}
update();
// Botão de retornar
var back = document.getElementById("back");
back.addEventListener('click', function () {
    if (stage == "MPs") {
        stage = "OPs";
        update();
    }
    else if (stage == "CNV") {
        stage = "MPs";
        update();
    }
});
// Obtem as OPs
var url = "/api/OPs";
var xhttp = new XMLHttpRequest();
xhttp.open("GET", url, false);
xhttp.send();
OPs = JSON.parse(xhttp.responseText);
// Aplica as OPs na tela
for (var i = 0; i < OPs.length; i++) {
    var temp = "<ul id=\"OP".concat(i, "\" class=\"grid OPselect cursor-pointer align-items-center\" style=\"height: 3rem\"><div class=\"col\"> ").concat(OPs[i].materiaPrimaName, " </div>\n<div class=\"col\"> ").concat(OPs[i].materiaPrimaCode, " </div>\n<div class=\"col\"> ").concat(OPs[i].materiaPrimaNumOp, " </div>\n</ul>");
    itens.push(temp);
}
itens.forEach(function (item) {
    OPselector.innerHTML += item;
});
var OPselect = Array.from(document.getElementsByClassName('OPselect'));
// Armazena a OP selecionada
OPselect.forEach(function (item) {
    item.addEventListener('click', function (e) {
        OPselected = parseInt(item.id.substr(item.id.length - 1, item.id.length));
        stage = "MPs";
        update();
        MP();
    });
});
function MP() {
    // Obtem as MPs
    MPs = [];
    itens = [];
    var viewCutsElements = [];
    MPselector.innerHTML = "<ul class=\"font-bold grid align-items-center\" style=\"height: 3rem;\"> \n  <div class=\"col\">Tamanho</div>\n  <div class=\"col\">Condi\u00E7\u00E3o</div>\n  <div class=\"col\">Disponibilidade</div>\n</ul>";
    var displayCutsButtons = document.getElementById("displayCutsButton");
    url = "/api/MPs?data=".concat(OPs[OPselected].materiaPrimaCode);
    xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.send();
    MPs = JSON.parse(xhttp.responseText);
    // Aplica as MPs na tela
    MPs.forEach(function (item, index) {
        var Element = "<ul id=\"MP ".concat(index, "\" class=\"grid MPselect cursor-pointer align-items-center\" style=\"height: 3rem\">\n<div class=\"col\"> ").concat(item.mpCompr, " X ").concat(item.mpLarg, " </div>\n<div class=\"col\"> ").concat(item.mpCondicao, " </div>\n<div class=\"col\"> ").concat(item.mpStatus, " </div>\n</ul>");
        itens.push(Element);
        if (item.mpCondicao == 'usada') {
            viewCutsElements.push("<div class=\"displayCuts\" id=\"displayCuts".concat(index, "\" class=\"card\"> Mostrar cortes </div>"));
        }
        else if (item.mpCondicao == 'novo') {
            viewCutsElements.push("<div class=\"displayCuts disabled\" disabled> Mostrar cortes </div>");
        }
    });
    itens.forEach(function (item) {
        MPselector.innerHTML += item;
    });
    viewCutsElements.forEach(function (item) {
        displayCutsButtons.innerHTML += item;
    });
    // Aramazena a MP selecionada
    var MPselect = Array.from(document.getElementsByClassName('MPselect'));
    MPselect.forEach(function (item) {
        item.addEventListener('click', function () {
            if (MPselected.indexOf(parseInt(item.id.substr(item.id.length - 1, item.id.length))) === -1) {
                MPselected.push(parseInt(item.id.substr(item.id.length - 1, item.id.length)));
                item.style.backgroundColor = "#75bef8";
            }
            else {
                MPselected.splice(MPselected.indexOf(parseInt(item.id.substr(item.id.length - 1, item.id.length))), 1);
                item.style.backgroundColor = "white";
            }
        });
    });
    var select = document.getElementById("Select");
    select.addEventListener('click', function () {
        if (MPselected.length != 0) {
            stage = "CNV";
            update();
            CNV();
        }
    });
}
// Canvas ===================================================================================================
function CNV() {
    var range = 40;
    var cutsOnPlate = [];
    var currentPlate = 0;
    var proportion = 1;
    var selected = -1;
    var description = document.getElementById("ComercialDescription");
    var info = document.getElementById("Info");
    var ctx1;
    var Sy;
    var Sx;
    var hoveredCut = -1;
    var canvas1 = document.getElementById("cnv1");
    var body = document.getElementsByTagName("body");
    var rotateCut = document.getElementById("rotate");
    var removeCut = document.getElementById("remove");
    var canvas2 = document.getElementById("cnv2");
    var px = 30;
    var width = 0;
    var transitionalCutsToAdd = [];
    var cutsToAdd = [];
    var occupiedGrid = [];
    var comparison = [];
    description.innerHTML = "";
    info.innerHTML = "";
    MPselected.forEach(function (item) {
        var element = document.createElement("div");
        element.innerHTML = "<div class=\"Guia\" id=\"Plate".concat(item, "\"> ").concat(MPs[item].comercialDescription, " </div>");
        description.appendChild(element);
    });
    info.innerHTML = "C\u00F3digo da chapa: ".concat(MPs[MPselected[currentPlate]].data, " / Embalagem: ").concat(MPs[MPselected[currentPlate]].mpEmbalagem, " / Tamanho: ").concat(MPs[MPselected[currentPlate]].mpCompr, " X ").concat(MPs[MPselected[currentPlate]].mpLarg);
    // Definindo tamanho da chapa e proporção
    function settingCanvas() {
        if (window.innerHeight * .5 < MPs[MPselected[currentPlate]].mpLarg) {
            canvas1.height = window.innerHeight * .5;
            proportion = ((window.innerHeight * .5) / MPs[MPselected[currentPlate]].mpLarg);
        }
        else {
            canvas1.height = MPs[MPselected[currentPlate]].mpLarg;
            proportion = 1;
        }
        canvas1.width = MPs[MPselected[currentPlate]].mpCompr * proportion;
        ctx1 = canvas1.getContext('2d');
        Sy = MPs[MPselected[currentPlate]].mpLarg * proportion;
        Sx = MPs[MPselected[currentPlate]].mpCompr * proportion;
    }
    settingCanvas();
    // Selecionando a chapa
    var plates = Array.from(document.getElementsByClassName("Guia"));
    plates[currentPlate].style.backgroundColor = "#75bef8";
    plates.forEach(function (item) {
        item.addEventListener('click', function () {
            plates.forEach(function (e) {
                e.style.backgroundColor = "white";
            });
            currentPlate = parseInt(item.id.substr(item.id.length - 1, item.id.length));
            item.style.backgroundColor = "#75bef8";
            settingCanvas();
            showCuts();
        });
        item.addEventListener('mousemove', function (event) {
            info.classList.add("active");
            info.style.top = "".concat(event.clientY, "px");
            info.style.left = "".concat(event.clientX, "px");
        });
        item.addEventListener('mouseout', function () {
            info.classList.remove("active");
        });
    });
    // Desenha na chapa
    function showCuts() {
        ctx1.clearRect(0, 0, Sx, Sy);
        cutsOnPlate.forEach(function (item, index) {
            if (item.plate == currentPlate) {
                // Desenha o retângulo
                ctx1.fillStyle = item.color;
                ctx1.fillRect(item.px, item.py, item.tx, item.ty);
                ctx1.strokeStyle = "#000";
                ctx1.strokeRect(item.px, item.py, item.tx, item.ty);
                // Escreve o texto
                ctx1.textAlign = "center";
                ctx1.textBaseline = "middle";
                ctx1.font = '9pt Arial';
                ctx1.fillStyle = 'black';
                ctx1.fillText("".concat(index), item.px + item.tx / 2, item.py + item.ty / 2);
            }
        });
    }
    // Verifica qual corte está sob o mouse
    canvas1.addEventListener('mousemove', function (mouseEvent) {
        var rect = canvas1.getBoundingClientRect();
        var CanvasMousePX = mouseEvent.clientX - rect.left;
        var CanvasMousePY = mouseEvent.clientY - rect.top;
        cutsOnPlate.forEach(function (item, index) {
            if (CanvasMousePX >= item.px && CanvasMousePX <= (item.px + item.tx) && CanvasMousePY >= item.py && CanvasMousePY <= (item.py + item.ty) && item.plate == currentPlate && item.draggable) {
                hoveredCut = index;
            }
        });
        if (hoveredCut >= 0) {
            if (CanvasMousePX >= cutsOnPlate[hoveredCut].px && CanvasMousePX <= (cutsOnPlate[hoveredCut].px + cutsOnPlate[hoveredCut].tx) && CanvasMousePY >= cutsOnPlate[hoveredCut].py && CanvasMousePY <= (cutsOnPlate[hoveredCut].py + cutsOnPlate[hoveredCut].ty) && cutsOnPlate[hoveredCut].plate == currentPlate && cutsOnPlate[hoveredCut].draggable) {
                canvas1.style.cursor = "grab";
            }
            else {
                canvas1.style.cursor = "default";
                hoveredCut = -1;
            }
        }
    });
    // Grid
    function drawGrid() {
        comparison = [];
        occupiedGrid = [];
        cutsOnPlate.forEach(function (item, index) {
            var cut = {
                index: index,
                startX: Math.floor((item.px) / 40),
                startY: Math.floor((item.py) / 40),
                endX: Math.ceil((item.px + item.tx) / 40),
                endY: Math.ceil((item.py + item.ty) / 40),
            };
            occupiedGrid.push(cut);
        });
        occupiedGrid.forEach(function (item1) {
            occupiedGrid.forEach(function (item2) {
                if (item1.index != item2.index && (((item1.startX >= item2.startX - 2 && item1.endX <= item2.endX + 2) && (item1.startY >= item2.startY - 3 && item1.endY <= item2.endY + 3)))) {
                    comparison.push(item1.index);
                    comparison.push(item2.index);
                }
            });
        });
    }
    // Sistema de arrange
    function arrange() {
        cutsOnPlate.forEach(function (item, index) {
            if (item.draggable && !comparison.includes(index)) {
                if (item.px <= range)
                    item.px = 0;
                if (item.px + item.tx >= Sx - range)
                    item.px = Sx - item.tx;
                if (item.py <= range)
                    item.py = 0;
                if (item.py + item.ty >= Sy - range)
                    item.py = Sy - item.ty;
            }
        });
        for (var i = 0; i < comparison.length; i++) {
            var moveX = canvas1.width;
            var moveY = canvas1.height;
            var collision = false;
            if (i % 2 != 0)
                continue;
            drawGrid();
            if (cutsOnPlate[comparison[i]] && cutsOnPlate[comparison[i + 1]]) {
                if ((comparison[i] != comparison[i + 1]) && ((cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty > cutsOnPlate[comparison[i + 1]].py && cutsOnPlate[comparison[i]].py < cutsOnPlate[comparison[i + 1]].py + cutsOnPlate[comparison[i + 1]].ty) &&
                    ((cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx > cutsOnPlate[comparison[i + 1]].px && cutsOnPlate[comparison[i]].px < cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx)))) {
                    if (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 < Sx / 2 && cutsOnPlate[comparison[i]].px < cutsOnPlate[comparison[i + 1]].px) {
                        cutsOnPlate[comparison[i + 1]].px = cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx;
                    }
                    else if (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 < Sx / 2 && cutsOnPlate[comparison[i]].px > cutsOnPlate[comparison[i + 1]].px) {
                        cutsOnPlate[comparison[i]].px = cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx;
                    }
                    else if (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 > Sx / 2 && cutsOnPlate[comparison[i]].px < cutsOnPlate[comparison[i + 1]].px) {
                        cutsOnPlate[comparison[i]].px = cutsOnPlate[comparison[i + 1]].px - cutsOnPlate[comparison[i + 1]].tx;
                    }
                    else if (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 > Sx / 2 && cutsOnPlate[comparison[i]].px > cutsOnPlate[comparison[i + 1]].px) {
                        cutsOnPlate[comparison[i + 1]].px = cutsOnPlate[comparison[i]].px - cutsOnPlate[comparison[i]].tx;
                    }
                    else if (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 < Sx / 2 && cutsOnPlate[comparison[i]].px == cutsOnPlate[comparison[i + 1]].px) {
                        cutsOnPlate[comparison[i]].px = cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx;
                    }
                    else if (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 > Sx / 2 && cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx == cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx) {
                        cutsOnPlate[comparison[i]].px = cutsOnPlate[comparison[i + 1]].px - cutsOnPlate[comparison[i + 1]].tx;
                    }
                }
                if ((cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 <= Sx / 2 && cutsOnPlate[comparison[i]].plate == cutsOnPlate[comparison[i + 1]].plate && cutsOnPlate[comparison[i]] != cutsOnPlate[comparison[i + 1]] && cutsOnPlate[comparison[i]].draggable) && ((cutsOnPlate[comparison[i]].px >= cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx / 2) && ((cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty >= cutsOnPlate[comparison[i + 1]].py && cutsOnPlate[comparison[i]].py <= cutsOnPlate[comparison[i + 1]].py + cutsOnPlate[comparison[i + 1]].ty)))) {
                    if (Math.abs(moveX) > Math.abs(cutsOnPlate[comparison[i]].px - cutsOnPlate[comparison[i + 1]].px - cutsOnPlate[comparison[i + 1]].tx))
                        moveX = -(cutsOnPlate[comparison[i]].px - cutsOnPlate[comparison[i + 1]].px - cutsOnPlate[comparison[i + 1]].tx);
                }
                if ((cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 >= Sx / 2 && cutsOnPlate[comparison[i]].plate == cutsOnPlate[comparison[i + 1]].plate && cutsOnPlate[comparison[i]] != cutsOnPlate[comparison[i + 1]] && cutsOnPlate[comparison[i]].draggable) && ((cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx <= cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx / 2) && ((cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty >= cutsOnPlate[comparison[i + 1]].py && cutsOnPlate[comparison[i]].py <= cutsOnPlate[comparison[i + 1]].py + cutsOnPlate[comparison[i + 1]].ty)))) {
                    if (Math.abs(moveX) > cutsOnPlate[comparison[i + 1]].px - cutsOnPlate[comparison[i]].px - cutsOnPlate[comparison[i]].tx)
                        moveX = cutsOnPlate[comparison[i + 1]].px - cutsOnPlate[comparison[i]].px - cutsOnPlate[comparison[i]].tx;
                }
                if ((cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty / 2 <= Sy / 2 && cutsOnPlate[comparison[i]].plate == cutsOnPlate[comparison[i + 1]].plate && cutsOnPlate[comparison[i]] != cutsOnPlate[comparison[i + 1]] && cutsOnPlate[comparison[i]].draggable) && ((cutsOnPlate[comparison[i]].py >= cutsOnPlate[comparison[i + 1]].py + cutsOnPlate[comparison[i + 1]].ty / 2) && ((cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx >= cutsOnPlate[comparison[i + 1]].px && cutsOnPlate[comparison[i]].px <= cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx)))) {
                    if (Math.abs(moveY) > (-cutsOnPlate[comparison[i + 1]].py - cutsOnPlate[comparison[i + 1]].ty + cutsOnPlate[comparison[i]].py))
                        moveY = -(-cutsOnPlate[comparison[i + 1]].py - cutsOnPlate[comparison[i + 1]].ty + cutsOnPlate[comparison[i]].py);
                }
                if ((cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty / 2 >= Sy / 2 && cutsOnPlate[comparison[i]].plate == cutsOnPlate[comparison[i + 1]].plate && cutsOnPlate[comparison[i]] != cutsOnPlate[comparison[i + 1]] && cutsOnPlate[comparison[i]].draggable) && ((cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty <= cutsOnPlate[comparison[i + 1]].py + cutsOnPlate[comparison[i + 1]].ty / 2) && ((cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx >= cutsOnPlate[comparison[i + 1]].px && cutsOnPlate[comparison[i]].px <= cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx)))) {
                    if (Math.abs(moveY) > cutsOnPlate[comparison[i + 1]].py - cutsOnPlate[comparison[i]].py - cutsOnPlate[comparison[i]].ty)
                        moveY = cutsOnPlate[comparison[i + 1]].py - cutsOnPlate[comparison[i]].py - cutsOnPlate[comparison[i]].ty;
                }
                if (cutsOnPlate[comparison[i]].px < 0)
                    cutsOnPlate[comparison[i]].px = 0;
                if (cutsOnPlate[comparison[i]].py < 0)
                    cutsOnPlate[comparison[i]].py = 0;
                if (Math.abs(moveX) > cutsOnPlate[comparison[i]].px)
                    moveX = -cutsOnPlate[comparison[i]].px;
                if (Math.abs(moveY) > cutsOnPlate[comparison[i]].py)
                    moveY = -cutsOnPlate[comparison[i]].py;
                if (Math.abs(moveX) > Sx - (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx) && Sx > (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx))
                    moveX = Sx - (cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx);
                if (Math.abs(moveY) > Sy - (cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty) && Sy > (cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty))
                    moveY = Sy - (cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty);
                if (Math.abs(moveX) < range)
                    cutsOnPlate[comparison[i]].px += moveX;
                if (Math.abs(moveY) < range)
                    cutsOnPlate[comparison[i]].py += moveY;
                if (collision && cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2 < Sx / 2) {
                    cutsOnPlate[comparison[i]].px += range;
                }
            }
        }
    }
    //Context Menu
    canvas1.addEventListener('contextmenu', function (mouseEvent) {
        if (hoveredCut < 0)
            return;
        mouseEvent.preventDefault();
        var menu = document.getElementById("context-menu");
        menu.style.top = mouseEvent.clientY + "px";
        menu.style.left = mouseEvent.clientX + "px";
        menu.classList.add("active");
        body[0].addEventListener('click', function (e) {
            var menu = document.getElementById("context-menu");
            menu.classList.remove("active");
        });
    });
    // Deleta o corte
    removeCut.addEventListener('click', function () {
        if (hoveredCut < 0)
            return;
        var temp = hoveredCut;
        var i = cutsToAdd.findIndex(function (e) { return (e.x == cutsOnPlate[temp].tx && e.y == cutsOnPlate[temp].ty) || (e.y == cutsOnPlate[temp].tx && e.x == cutsOnPlate[temp].ty); });
        var b = cutsToAdd[i].color.findIndex(function (j) { return j == "rgba(2,2,2,.3)"; });
        cutsToAdd[i].color[b] = "rgba(255,0,0,.3)";
        cutsOnPlate.splice(temp, 1);
        hoveredCut = -1;
        showCuts();
        showCutsToAdd();
    });
    // Rotaciona o corte
    rotateCut.addEventListener('click', function () {
        if (hoveredCut < 0)
            return;
        var temp = cutsOnPlate[hoveredCut].tx;
        cutsOnPlate[hoveredCut].tx = cutsOnPlate[hoveredCut].ty;
        cutsOnPlate[hoveredCut].ty = temp;
        showCuts();
    });
    // Seleciona o corte
    canvas1.onmousedown = function (evt) {
        var rect = canvas1.getBoundingClientRect();
        var CanvasMousePX = evt.clientX - rect.left;
        var CanvasMousePY = evt.clientY - rect.top;
        var initialMouseX = evt.clientX;
        var initialMouseY = evt.clientY;
        var initialCutPX;
        var initialCutPY;
        var moveX;
        var moveY;
        var tracing;
        // Seleciona o retângulo
        cutsOnPlate.forEach(function (item) {
            if (CanvasMousePX >= item.px && CanvasMousePX <= (item.px + item.tx) && CanvasMousePY >= item.py && CanvasMousePY <= (item.py + item.ty) && item.plate == currentPlate && item.draggable) {
                selected = cutsOnPlate.indexOf(item);
            }
        });
        if (selected >= 0) {
            canvas1.style.cursor = "grabbing";
            initialCutPX = cutsOnPlate[selected].px;
            initialCutPY = cutsOnPlate[selected].py;
        }
        if (selected >= 0) {
            // Arrasta o retângulo
            tracing = function (evt) {
                if (selected >= 0) {
                    canvas1.style.cursor = "grabbing";
                    moveX = initialCutPX + evt.clientX - initialMouseX;
                    moveY = initialCutPY + evt.clientY - initialMouseY;
                    cutsOnPlate[selected].py = Math.round(moveY);
                    cutsOnPlate[selected].px = Math.round(moveX);
                    cutsOnPlate[selected].color = "rgba(0,0,255,.3)";
                    showCuts();
                }
            };
            // Soltar o retângulo
            var mouseup_1 = function () {
                if (selected >= 0) {
                    canvas1.style.cursor = "grab";
                    canvas1.removeEventListener('mousemove', tracing);
                    cutsOnPlate[selected].color = "rgba(0,255,0,.3)";
                    showCuts();
                    drawGrid();
                    for (var i = 0; i < comparison.length; i += 2) {
                        if (cutsOnPlate[comparison[i]].plate == cutsOnPlate[comparison[i + 1]].plate) {
                            ctx1.beginPath();
                            ctx1.moveTo(cutsOnPlate[comparison[i]].px + cutsOnPlate[comparison[i]].tx / 2, cutsOnPlate[comparison[i]].py + cutsOnPlate[comparison[i]].ty / 2);
                            ctx1.lineTo(cutsOnPlate[comparison[i + 1]].px + cutsOnPlate[comparison[i + 1]].tx / 2, cutsOnPlate[comparison[i + 1]].py + cutsOnPlate[comparison[i + 1]].ty / 2);
                            ctx1.strokeStyle = "rgba(0,0,0,.3)";
                            ctx1.stroke();
                        }
                    }
                    cutsOnPlate.forEach(function () {
                        arrange();
                    });
                    showCuts();
                    selected = -1;
                    canvas1.removeEventListener('mouseup', mouseup_1);
                }
            };
            if (selected >= 0) {
                canvas1.addEventListener('mousemove', tracing);
                canvas1.addEventListener('mouseup', mouseup_1);
            }
        }
        // Soltar o retângulo
        canvas1.onmouseleave = function () {
            arrange();
            canvas1.removeEventListener('mousemove', tracing);
            selected = -1;
        };
    };
    // Upload Cuts
    var uploadButton = document.getElementById("uploadModel");
    uploadButton.addEventListener('click', function () {
        var packaging = [];
        MPselected.forEach(function (item) {
            packaging.push(MPs[item].mpEmbalagem);
        });
        cutsOnPlate.forEach(function (item) {
            var url = "/api/ModelCuts";
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", url, false);
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(JSON.stringify({
                blkPositionX: Math.round(item.px / proportion),
                blkPositionY: Math.round(item.py / proportion),
                blkCompr: Math.round(item.tx / proportion),
                blkLarg: Math.round(item.ty / proportion),
                blkOp: item.op,
                blkPlaca: item.plate,
                packages: packaging
            }));
        });
    });
    // Segundo Canvas =====================================================================================================================================
    url = "/api/blank?blkOp=".concat(OPs[OPselected].materiaPrimaNumOp);
    xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.send();
    transitionalCutsToAdd = JSON.parse(xhttp.responseText);
    transitionalCutsToAdd.forEach(function (item) {
        cutsToAdd.push({
            x: item.blkCompr * proportion,
            y: item.blkLarg * proportion,
            oX: item.blkCompr,
            oY: item.blkLarg,
            qtd: item.blkQtd,
            op: item.blkOp,
            positionX: [],
            positionY: [],
            color: [],
            plate: currentPlate
        });
    });
    function setWidth() {
        width = 0;
        cutsToAdd.forEach(function (item) {
            for (var i = 0; i < item.qtd; i++) {
                width += 60 + item.x;
                item.color.push("rgba(255,0,0,.3)");
            }
        });
        canvas2.height = 0.2 * window.innerHeight;
        canvas2.width = width;
    }
    setWidth();
    var ctx2 = canvas2.getContext('2d');
    function showCutsToAdd() {
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        px = 30;
        cutsToAdd.forEach(function (item) {
            for (var i = 0; i < item.qtd; i++) {
                item.positionX[i] = px;
                item.positionY[i] = (canvas2.height - item.y) / 2;
                ctx2.fillStyle = item.color[i];
                ctx2.fillRect(px, (canvas2.height - item.y) / 2, item.x, item.y);
                ctx2.strokeStyle = "#000";
                ctx2.strokeRect(px, (canvas2.height - item.y) / 2, item.x, item.y);
                ctx2.textAlign = "center";
                ctx2.textBaseline = "middle";
                ctx2.font = '8pt Arial';
                ctx2.fillStyle = 'black';
                ctx2.fillText("".concat(item.oX, " X ").concat(item.oY), px + item.x / 2, 15);
                px += item.x + 60;
            }
        });
    }
    showCutsToAdd();
    // Add Menu
    var addButton = document.getElementById("addButton");
    var addForm = document.getElementById("addForm");
    function addMenu() {
        var addMenu = document.getElementById("addMenu");
        if (addMenu.classList.contains("active")) {
            addMenu.classList.remove("active");
        }
        else {
            addMenu.classList.add("active");
        }
    }
    addButton.addEventListener("click", addMenu);
    addForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var x = parseInt(addForm.elements.namedItem("x").value);
        var y = parseInt(addForm.elements.namedItem("y").value);
        var qtd = parseInt(addForm.elements.namedItem("qtd").value);
        if (x > 0 && y > 0 && qtd > 0) {
            cutsToAdd.push({
                x: x * proportion,
                oX: x,
                y: y * proportion,
                oY: y,
                qtd: qtd,
                op: 'none',
                positionX: [],
                positionY: [],
                color: [],
                plate: currentPlate
            });
            setWidth();
            showCutsToAdd();
        }
    });
    // Click
    var mouseDown = function (evt) {
        var rect2 = canvas2.getBoundingClientRect();
        var x = evt.clientX - rect2.left;
        var y = evt.clientY - rect2.top;
        cutsToAdd.forEach(function (item) {
            for (var i = 0; i < item.qtd; i++) {
                if (x >= item.positionX[i] && x <= item.positionX[i] + (item.x) && y >= item.positionY[i] && y <= item.positionY[i] + item.y && item.color[i] != "rgba(2,2,2,.3)") {
                    cutsOnPlate.push({ px: 0, py: 0, tx: item.x, ty: item.y, op: item.op, color: "rgba(255,0,0, .3)", plate: currentPlate, colision: false, draggable: true });
                    item.color[i] = "rgba(2,2,2,.3)";
                    showCutsToAdd();
                    showCuts();
                }
            }
        });
        console.log(cutsToAdd);
    };
    addEventListener('mousedown', mouseDown);
}
var cutsView = function (packaging) {
    url = "/api/modelCuts";
    xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.send();
    var modelCuts = JSON.parse(xhttp.responseText);
    var cutsPlan = [];
    modelCuts.forEach(function (item) {
        if (item.packages.includes(packaging)) {
            cutsPlan.push(item);
        }
    });
    console.log(cutsPlan);
};
