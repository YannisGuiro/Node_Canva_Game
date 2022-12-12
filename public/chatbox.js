const canvas = document.getElementById("cv");
const ctx = canvas.getContext("2d");

import { keyboard, keyInput, deleteKeyInput, mouse } from './keys.js'
import { player } from './player.js';
var date = new Date;
const socket = io()

class ChatBox {
    constructor() {
        this.width = 290;
        this.height = 240;
        this.x = 500;
        this.y = 320;

        this.liney = this.y + this.height - 25;

        this.entered_txt = "";
        this.txt = "";
        this.registeredlines = {};
        this.lines = [];
        this.lastlines;

        this.btns = new Image();
        this.btns.src = "./sprites/buttons.png";
        this.size = 11;
        this.closebuttonpos = [765, this.y - 25, 0]
        this.sizebuttonpos = [740, this.y - 25, 0]

        this.first = true;
    }

    getLines(l) {
        this.registeredlines[player.talkingTo] = l
    }
    update() {
        this.lines = (this.registeredlines[player.talkingTo] || []);
        // Gestion de texte qu'on entre.
        this.entered_txt += keyInput;

        if (keyboard['Backspace']) {
            this.entered_txt = this.entered_txt.slice(0, -1);
        }
        if (keyboard['Enter']) {

            if (this.entered_txt.length) {
                let tmp = "(" + date.toTimeString().substr(0, 5) + ") " + player.name + " : " + this.entered_txt;
                this.addLine(tmp)
                this.registeredlines[player.talkingTo] = this.lines
                this.entered_txt = ""
            }
        }
        // Partie assez importante, qui permet de définir combien de ligne on affiche, en fonction de la taille de la fenetre de chat.
        let nbLine = Math.floor(this.height / 20);

        // On ajoute la phrase qui indique à qui on parle
        if (this.lines.length < nbLine - 1) {
            this.first = true;
            if (ctx.measureText(player.talkingName).width < 90) {
                this.lastlines = this.lines.slice(0, this.lines.length)
                this.lastlines.splice(0, 0, "Vous parlez maintenant avec " + player.talkingName + ".");
            }
            else {
                this.lastlines = this.lines.slice(0, this.lines.length)
                this.lastlines.splice(0, 0, "Vous parlez maintenant avec ");
                this.lastlines.splice(1, 0, player.talkingName + ".");
            }
        }
        else if (this.lines.length == nbLine - 1) {
            this.lastlines = this.lines.slice(this.lines.length - nbLine + 1, this.lines.length)
            this.first = true;

            if (ctx.measureText(player.talkingName).width < 90) {
                this.lastlines.splice(0, 0, "Vous parlez maintenant avec ");
            }
            else {
                this.lastlines.splice(0, 0, player.talkingName + ".");
            }
        }

        else {
            this.first = false;
            this.lastlines = this.lines.slice(this.lines.length - nbLine, this.lines.length)
        }


        // Bouton pour fermer et ouvrir la fenêtre
        if ((mouse.x > this.closebuttonpos[0]) && (mouse.x < this.closebuttonpos[0] + 22) && (mouse.y > this.closebuttonpos[1]) && (mouse.y < this.closebuttonpos[1] + 22)) {
            this.closebuttonpos[2] = 11;
            if (mouse.clicked) player.endConv = true;
        }
        else this.closebuttonpos[2] = 0;

        if ((mouse.x > this.sizebuttonpos[0]) && (mouse.x < this.sizebuttonpos[0] + 22) && (mouse.y > this.sizebuttonpos[1]) && (mouse.y < this.sizebuttonpos[1] + 22)) {
            this.sizebuttonpos[2] = 11;
            if (mouse.clicked) {
                if (this.size == 11) {
                    this.sizebuttonpos[1] -= 200
                    this.closebuttonpos[1] -= 200
                    this.height += 200
                    this.y -= 200
                    this.size = 22;
                }
                else {
                    this.sizebuttonpos[1] += 200
                    this.closebuttonpos[1] += 200
                    this.height -= 200
                    this.y += 200
                    this.size = 11;
                }
            }

        }
        else this.sizebuttonpos[2] = 0;

        // On envoie le texte mis a jour a tt le monde, celui dont l'ID est envoyé se reconnait.


    }
    draw() {

        // On dessine le chatbox
        ctx.globalAlpha = 0.7
        ctx.fillStyle = "#772C6D"
        ctx.roundRect(this.x, this.y, this.width, this.height, 8).fill() // Bords arrondi
        ctx.globalAlpha = 1

        ctx.strokeStyle = "#FF7FED"
        ctx.roundRect(this.x, this.y, this.width, this.height, 8).stroke(); // Rectangle arrondi

        // On dessine la box pour écrire :

        ctx.globalAlpha = 0.7
        ctx.fillStyle = "#772C6D"
        ctx.roundRect(this.x, this.y + this.height + 5, this.width, 30, 0).fill() // Bords arrondi
        ctx.globalAlpha = 1

        ctx.strokeStyle = "#FF7FED"
        ctx.roundRect(this.x, this.y + this.height + 5, this.width, 30, 0).stroke(); // Rectangle arrondi
        // On prend la liste des phrases à écrire
        ctx.font = "18px Triakis";

        // On dessine ce que le joueur a écrit :
        let tmp = this.entered_txt;
        while (ctx.measureText(tmp).width > 280) tmp = tmp.substring(1)
        ctx.fillStyle = "black";
        ctx.fillText(tmp, this.x + 7, this.y + this.height + 26);

        ctx.fillStyle = "white";
        ctx.fillText(tmp, this.x + 5, this.y + this.height + 24);

        // On initialise la position de la première phrase
        let x = this.x + 5;
        let y = this.liney - ((this.lastlines.length - 2) * 20);
        let old_color
        let first = this.first
        // On écrit chaque phrase juste en dessous de l'autre.
        this.lastlines.forEach(function (line) {
            ctx.fillStyle = "black";
            ctx.fillText(line, x + 2, y + 2);

            if (first) {
                old_color = "#32CD32"
                first = false;
            }
            else if (line.split(':')[1]) {
                let tmp = line.split(':')[1].substring(4)
                if (tmp == (player.name + " ")) old_color = player.name_color;
                else old_color = "white"
            }
            ctx.fillStyle = old_color
            ctx.fillText(line, x, y);
            y += 20;
        })
        //this.liney = y;
        ctx.font = "25px Triakis";

        // On afficher les 2 boutons
        ctx.drawImage(this.btns, 0, this.closebuttonpos[2], 11, 11, this.closebuttonpos[0], this.closebuttonpos[1], 22, 22);
        ctx.drawImage(this.btns, this.size, this.sizebuttonpos[2], 11, 11, this.sizebuttonpos[0], this.sizebuttonpos[1], 22, 22);

        //if(!player.talkingTo) this.clean()

    }

    clean() {
        this.entered_txt = "";
        this.txt = "";
        this.lines = [];
        this.lastlines;
    }
    addLine(s) {
        ctx.font = "18px Triakis";

        calcLines(s, 280)
        ctx.font = "25px Triakis";

        socket.emit('update texts', this.lines, player.talkingTo)
    }
}
const chatBox = new ChatBox();
export { chatBox };


class InterBox {
    constructor() {
        this.width = 200;
        this.height = 30;
        this.x = (canvas.width - this.width) / 2;
        this.y = (canvas.height - this.height * 2);
        this.txt = "";
        this.poke = false;
    }

    draw() {


        if (this.poke) {
            this.width = ctx.measureText(this.txt).width + 10;
            this.x = (canvas.width - this.width) / 2;

            ctx.globalAlpha = 0.7
            ctx.fillStyle = "#772C6D"
            ctx.roundRect(this.x, this.y - 40, this.width, this.height, 8).fill() // Bords arrondi
            ctx.globalAlpha = 1

            ctx.strokeStyle = "#FF7FED"
            ctx.roundRect(this.x, this.y - 40, this.width, this.height, 8).stroke(); // Rectangle arrondi

            ctx.fillStyle = "black";
            ctx.fillText(this.txt, this.x + 7, this.y - 40 + 24);

            ctx.fillStyle = "white";
            ctx.fillText(this.txt, this.x + 4, this.y - 40 + 22);

            this.txt = "Appuyez sur 'Entrée' pour accepter, Ou 'X' pour refuser."
            this.width = ctx.measureText(this.txt).width + 10;
            this.x = (canvas.width - this.width) / 2;

            ctx.globalAlpha = 0.7
            ctx.fillStyle = "#772C6D"
            ctx.roundRect(this.x, this.y, this.width, this.height, 8).fill() // Bords arrondi
            ctx.globalAlpha = 1

            ctx.strokeStyle = "#FF7FED"
            ctx.roundRect(this.x, this.y, this.width, this.height, 8).stroke(); // Rectangle arrondi

            ctx.fillStyle = "black";
            ctx.fillText(this.txt, this.x + 7, this.y + 24);

            ctx.fillStyle = "white";
            ctx.fillText(this.txt, this.x + 4, this.y + 22);
        }
        else {
            this.width = ctx.measureText(this.txt).width + 10;
            this.x = (canvas.width - this.width) / 2;

            ctx.globalAlpha = 0.7
            ctx.fillStyle = "#772C6D"
            ctx.roundRect(this.x, this.y, this.width, this.height, 8).fill() // Bords arrondi
            ctx.globalAlpha = 1

            ctx.strokeStyle = "#FF7FED"
            ctx.roundRect(this.x, this.y, this.width, this.height, 8).stroke(); // Rectangle arrondi

            ctx.fillStyle = "black";
            ctx.fillText(this.txt, this.x + 7, this.y + 24);

            ctx.fillStyle = "white";
            ctx.fillText(this.txt, this.x + 4, this.y + 22);
        }
    }

}

class OtherBox {
    constructor() {
        this.width = 200;
        this.height = 30;
        this.x = (canvas.width - this.width) / 2;
        this.y = this.height * 2;
        this.msg = {}
    }

    draw() {


        if (this.msg){
            this.width = ctx.measureText(this.msg).width + 10;
            this.x = (canvas.width - this.width) / 2;

            ctx.fillStyle = "black"
            ctx.roundRect(this.x, this.y, this.width, this.height, 8).fill() // Bords arrondi
            ctx.globalAlpha = 1

            ctx.strokeStyle = "white"
            ctx.roundRect(this.x, this.y, this.width, this.height, 8).stroke(); // Rectangle arrondi

            ctx.fillStyle = "grey";
            ctx.fillText(this.msg, this.x + 7, this.y + 24);

            ctx.fillStyle = "white";
            ctx.fillText(this.msg, this.x + 4, this.y + 22);
        }
    }
}


const otherBox = new OtherBox()
export { otherBox };


const interBox = new InterBox()
export { interBox };

class ConnectBox {
    constructor() {
        this.width = 290;
        this.height = 20;
        this.x = canvas.width - this.width - 20;
        this.y = 20;

        this.texts = []
    }

    addTexts(s) {
        let tmp = [s + " nous a rejoint.", 1]
        this.texts.push(tmp)
    }
    draw() {

        ctx.font = "18px Triakis";

        let x = this.x;
        let y = this.y;
        let width = this.width
        let height = this.height
        for (var key in this.texts) {
            let tmp = this.texts[key]
            ctx.globalAlpha = tmp[1]
            ctx.fillStyle = "#772C6D"
            ctx.roundRect(x, y, width, height, 8).fill() // Bords arrondi

            ctx.strokeStyle = "#FF7FED"
            ctx.roundRect(x, y, width, height, 8).stroke(); // Rectangle arrondi

            ctx.fillStyle = "black";
            ctx.fillText(tmp[0], x + 7, y + 16);

            ctx.fillStyle = "white"
            ctx.fillText(tmp[0], x + 4, y + 14);
            ctx.globalAlpha = 1;

            y += 24;
            this.texts[key][1] -= 0.002
            if (this.texts[key][1] <= 0) delete this.texts[key]
        }


        ctx.font = "25px Triakis";

    }

}
const connectBox = new ConnectBox()
export { connectBox };



class DCBox {
    constructor() {
        this.width = 140;
        this.height = 30;
        this.x = 20
        this.y = 20;

        this.sprite = new Image();
        this.sprite.src = "./sprites/dc_btn.png";
    }
    draw() {

        if ((mouse.x > this.x) && (mouse.x < this.x + this.width) && (mouse.y > this.y) && (mouse.y < this.y + this.height)) {
            ctx.drawImage(this.sprite, 0, 18, 70, 18, this.x, this.y, this.width, this.height)
            if (mouse.clicked) player.die = true;
        }
        else {
            ctx.drawImage(this.sprite, 0, 0, 70, 18, this.x, this.y, this.width, this.height)

        }


        ctx.font = "25px Triakis";

    }

}
const dcBox = new DCBox()
export { dcBox };

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
}

function calcLines(text, maxWidth) {

    let lines = text.split("\n");

    for (var i = 0; i < lines.length; i++) {

        var words = lines[i].split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;

            if (testWidth > maxWidth) {
                if (n == 0) {
                    words.splice(1, 0, words[0].substring(10))
                    words[0].splice(10, words[0].length)
                }
                chatBox.lines.push(line)
                line = words[n] + ' ';
            }
            else {
                line = testLine;
            }
        }

        chatBox.lines.push(line)

    }


}