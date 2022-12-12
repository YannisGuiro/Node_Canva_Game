// 
// Keyboard events

export var keyboard = {};
export var keyboardup = {};
export var keyInput = '';
export function deleteKeyInput() {keyInput=''}


window.onkeydown = function (e) {
    keyboard[e.key] = true;

};

window.onkeyup = function (e) {
    delete keyboard[e.key]
    //keyboardup[e.key] = true;

};

window.onkeypress = function (e) {
    if (e.key != 'Enter') {
        keyInput = e.key;
    };
}



export var mouse = {
    x: 0,
    y: 0,
    clicked: false,
    moved: false,
}

canvas.addEventListener('mousemove', function (event) {
    let canvasPos = canvas.getBoundingClientRect();
    mouse.x = event.x - canvasPos.left;
    mouse.y = event.y - canvasPos.top;
    mouse.moved = true;
});
canvas.addEventListener('mousedown', function (event) {
    //console.log(mouse.x + "," + mouse.y);
});
canvas.addEventListener('mouseup', function (event) {
    //console.log(mouse.x + "," + mouse.y);
    mouse.clicked = true;
});

export function mouseReset() {
    mouse.clicked = false;
    mouse.moved = false;
}

export function cleanKeyboard(){
    delete keyboard['Enter']
    delete keyboard['Backspace']

}