import { keyboard, keyInput, deleteKeyInput, mouse } from './keys.js'
import { socket, index } from './game.js'
import { player } from './player.js';

const canvas = document.getElementById("cv");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = 0;
ctx.font = "25px Triakis";
ctx.fillStyle = "White";
var textInput = 'Name';
var textExample = true;

var portraits = new Image();
portraits.src = "./sprites/portraits.png";

var rdmSelect = Math.floor(Math.random() * 9);


export class CharSelection {
    constructor() {
        this.width = 500;
        this.height = 500;
        this.x = (canvas.width - this.width) / 2;
        this.y = (canvas.height - this.height) / 2;

        this.sprite = new Image();
        this.sprite.src = "./sprites/menu_selec.png";

        this.selected = rdmSelect; // Pokémon choisi de base
        this.confirmed = rdmSelect; // On ne sait pas encore quel pkmn sera choisi
        this.confirmed_spriteX = undefined;
        this.confirmed_spriteY = undefined;

        this.selectOrder = [ // X, Y, "FIELD_NAME", WIDTH, HEIGHT du border
            [244, 106, "pikachu", 92, 92],
            [354, 106, "eevee", 92, 92],
            [464, 106, "cubone", 92, 92],
            [244, 216, "spinda", 92, 92],
            [354, 216, "shinx", 92, 92],
            [464, 216, "skitty", 92, 92],
            [244, 326, "treecko", 92, 92],
            [354, 326, "mudkip", 92, 92],
            [464, 326, "torchic", 92, 92],
            [240, 448, "NicknameText", 320, 40],
            [380, 490, "Confirm", 40, 40],
        ]

        // Sprite pour les bords des icones
        this.borders = new Image();
        this.borders.src = "./sprites/borders.png";
        this.selected_spriteX = this.selectOrder[this.selected][0];
        this.selected_spriteY = this.selectOrder[this.selected][1];

        // Sprite du champ de texte pour le pseudo (survolé)
        this.nickname_sprite = new Image();
        this.nickname_sprite.src = "./sprites/nickname_field.png";

        // Sprite du bouton de confirmation (survolé)
        this.confirm_sprite = new Image();
        this.confirm_sprite.src = "./sprites/confirm_button.png";

        // Variable utilisée plus tard pour savoir si la souris sélectionn encore qqchose
        this.mouse_is_in = false;

    }
    draw() {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        if (this.selected < 9) {
            ctx.drawImage(portraits, 40, 40 * (this.selected + 1), 40, 40, this.selected_spriteX + 6, this.selected_spriteY + 6, 80, 80);
            ctx.drawImage(this.borders, 0, 0, 46, 46, this.selected_spriteX, this.selected_spriteY, this.selectOrder[this.selected][3], this.selectOrder[this.selected][4]);
        }
        else if (this.selected == 9) {
            ctx.drawImage(this.nickname_sprite, 240, 448, this.selectOrder[this.selected][3], this.selectOrder[this.selected][4]);
        }
        else if (this.selected == 10) {
            ctx.drawImage(this.confirm_sprite, 380, 490, this.selectOrder[this.selected][3], this.selectOrder[this.selected][4]);
        }

        if (typeof this.confirmed !== 'undefined') {
            ctx.drawImage(portraits, 80, 40 * (this.confirmed + 1), 40, 40, this.confirmed_spriteX + 6, this.confirmed_spriteY + 6, 80, 80);
            ctx.drawImage(this.borders, 92, 0, 46, 46, this.confirmed_spriteX, this.confirmed_spriteY, this.selectOrder[0][3], this.selectOrder[0][4]);

        }
        if (textExample) { ctx.fillStyle = "silver"; }
        else { ctx.fillStyle = "white"; }
        ctx.fillText(textInput, 250, 475);

    }

    update() {
        // Rien de compliqué, on gère la sélection de portrait quand on appuie sur une flèche.
        // Chaque portrait selectionnable (+ le texte et le bouton confirmer) se numérote avec selected
        if (keyboard["ArrowUp"]) // Haut
        {
            switch (this.selected) {
                case 0:
                case 1:
                case 2: { this.selected = 10; break; }
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8: { this.selected -= 3; break; }
                case 9: { this.selected = 7; break; }
                case 10: { this.selected = 9; break; }
            }
            keyboard["ArrowUp"] = false;
        }

        if (keyboard["ArrowDown"]) // Bas
        {
            switch (this.selected) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5: { this.selected += 3; break; }
                case 6:
                case 7:
                case 8: { this.selected = 9; break; }
                case 9: { this.selected = 10; break; }
                case 10: { this.selected = 1; break; }
            }
            keyboard["ArrowDown"] = false;
        }

        if (keyboard["ArrowRight"]) // Droite
        {
            switch (this.selected) {
                case 0:
                case 1:
                case 3:
                case 4:
                case 6:
                case 7: { this.selected += 1; break; }
                case 2:
                case 5:
                case 8: { this.selected -= 2; break; }
                case 9: { break; }
                case 10: { break; }
            }
            keyboard["ArrowRight"] = false;
        }

        if (keyboard["ArrowLeft"]) // Gauche
        {
            switch (this.selected) {
                case 1:
                case 2:
                case 4:
                case 5:
                case 7:
                case 8: { this.selected -= 1; break; }
                case 0:
                case 3:
                case 6: { this.selected += 2; break; }
                case 9: { break; }
                case 10: { break; }
            }
            keyboard["ArrowLeft"] = false;
        }



        if (textExample && keyInput != '') {
            textExample = false;
            textInput = '';
        }
        if (keyboard["Backspace"]) {
            textInput = textInput.slice(0, -1);
        }
        if ((ctx.measureText(textInput).width < 240) && textInput.length < 30) {
            textInput += keyInput;
        }
        //deleteKeyInput();


        // On a géré la plupart des inputs claviers, maintenant on gère la souris ! ////
        if (mouse.moved) {
            for (var i = 0; i < 11; i++) {
                if (
                    (mouse.x > this.selectOrder[i][0]) &&
                    (mouse.x < (this.selectOrder[i][0] + this.selectOrder[i][3])) &&
                    (mouse.y > this.selectOrder[i][1]) &&
                    (mouse.y < (this.selectOrder[i][1] + this.selectOrder[i][4]))) {
                    this.selected = i;
                    this.mouse_is_in = true;
                    i = 11;
                }
                else if (i == 10) {
                    this.mouse_is_in = false;
                }
            }

        }

        if (keyboard["Enter"] || (mouse.clicked && this.mouse_is_in)) {
            if (this.selected < 9) {
                this.confirmed = this.selected;
                this.confirmed_spriteX = this.selected_spriteX;
                this.confirmed_spriteY = this.selected_spriteY;
            }
            ///////////////////////////////////////////////
            if (this.selected == 10) //on ferme la fenêtre
            {
                if(textInput == "") textInput="No Name"
                player.init(this.selectOrder[this.confirmed][2], textInput);
                socket.emit('connect player', player);
            }
        }

        //Une fois qu'on a choisi le nouveau portrait selectionné à l'aide des flèches keyboardectionnelles
        // On Change le sprite_selected de coordonnées.
        this.selected_spriteX = this.selectOrder[this.selected][0];
        this.selected_spriteY = this.selectOrder[this.selected][1];

    }
    getSelected() {
        return this.selected;
    }
}