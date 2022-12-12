import { keyboard, keyboardup, deleteKeyInput, mouseReset } from './keys.js'
import { index } from './game.js'
import { interBox, chatBox } from './chatbox.js';
import { map } from './map.js';
const canvas = document.getElementById("cv");
const ctx = canvas.getContext("2d");


// Liste des sprites + de leur couleur correspondante
var pokemon_infos = {
    "pikachu": ["#F8F000", 7],
    "eevee": ["#D87018", 5],
    "cubone": ["#D0D8D8", 7],
    "spinda": ["#F88058", 7],
    "shinx": ["#AFE7F7", 5],
    "skitty": ["#F888A8", 5],
    "treecko": ["#88B020", 7],
    "mudkip": ["#42A5DE", 5],
    "torchic": ["#F89040", 7],
}

class Player {

    constructor(x = 3650, y = 5000) {
        this.width = 64;
        this.height = 64;

        this.shownx = 400 - this.width / 2;
        this.showny = 300 - this.width / 2;
        this.x = x;
        this.y = y;
        this.keyboard = [0, 0, 0, 0]; // UP, DOWN, LEFT, RIGHT
        this.speed = 4;
        this.just_stopped = 0;

        this.spritepath = "";
        this.spritex = 32;
        this.spritey = 32;
        this.sprite_width = 0;

        this.name = "";
        this.namex = 0;
        this.name_color = undefined;

        // Variables qui permettent l'animation du sprite
        this.frame = 0; // Celle qui avance toujours sans jamais etre reset
        this.time_to_sleep = 60; // Combien de frames sans bouger avant de dormir
        this.frame_notmoving = this.time_to_sleep; // Celle qui avance quand le perso ne bouge pas
        this.current_frame = 0; // Celle qui avance toutes les animation_speed frames mais se reset quand l'animation est terminée
        this.max_frame = 0; // Nombre max de frame de l'animation
        this.framex = this.spritex; // Pos de la frame actuelle de l'animation
        this.framey = this.spritey;

        this.time_to_sleep = 300; // Temps avant que le perso de s'endorme (en frames, donc /60)
        this.animation_speed = 8; // Soit 60/animation_speed frames d'animation par secondes

        this.closeTo = undefined;
        this.talkingTo = undefined;
        this.talkingName = ""
        this.waiting = undefined;
        this.cancelledtalk = false;
        this.endConv = false;

        this.afk = 0;
        this.was_afk = false;
        this.die = false;
        this.diewait = 0;
        this.id = undefined;
    }
    move(x, y) {
        this.x = x
        this.y = y
    }

    update() {
        let collide = false;
        if (this.was_afk) // Cas ou le joueur était afk
        {
            player.closeTo = undefined;
            player.talkingTo = undefined;
            player.was_afk = false;
            player.waiting = undefined
        }
        // Gère la keyboardection du joueur en fonction des touches :

        if (keyboard["ArrowUp"]) {
            this.keyboard[0] = this.speed;
        }
        else this.keyboard[0] = 0;
        if (keyboard["ArrowDown"]) {
            this.keyboard[1] = this.speed;
        }
        else this.keyboard[1] = 0;
        if (keyboard["ArrowLeft"]) {
            this.keyboard[2] = this.speed;
        }
        else this.keyboard[2] = 0;
        if (keyboard["ArrowRight"]) {
            this.keyboard[3] = this.speed;
        }
        else this.keyboard[3] = 0;

        if ((keyboard["e"])) this.speed = 10
        else this.speed = 4

        if (!this.die) {
            let x = this.x
            let y = this.y
            this.x += (this.keyboard[3] - this.keyboard[2]);
            this.y += (this.keyboard[1] - this.keyboard[0]);

            if (map.checkCollisions(this.x, this.y, 64)) {
                this.x = x
                this.y = y
            }
        }
        // Pour la fonction de décès
        else {
            if (!this.height || !this.width) {
                this.refresh()
            }
            if (this.diewait > 2) {
                this.height -= 2;
                this.x++
                this.width -= 2;
                this.y++
                this.diewait = 0;
            }
            else this.diewait++;
        }



        // On gère l'animation en fonction des frames

        // Savoir si le joueur est en mouvement ou pas
        if (-this.keyboard[0] + this.keyboard[1] != 0 || -this.keyboard[2] + this.keyboard[3] != 0) {
            this.spritex = ((this.keyboard[3] - this.keyboard[2]) / this.speed) * 32 + 32;
            this.spritey = ((this.keyboard[1] - this.keyboard[0]) / this.speed) * 32 + 32;
            this.frame_notmoving = 0;
        }
        else this.frame_notmoving++;


        // On avance d'une frame :
        if(!this.die)this.frame++;

        if (this.frame_notmoving >= this.time_to_sleep) { // Si le joueur ne bouge pas pdt XXX frames, ou XXX/60 secondes :
            this.spritex = 32;
            this.spritey = 32;
        }

        if (!(this.frame % this.animation_speed)) // L'animation avance chaque animation_speed frame
        {
            if (this.current_frame == this.max_frame) this.current_frame = 0;
            else this.current_frame++;
        }

        // On choisi la frame d'animation maintenant, on fonction des paramètres changés auparavant


        this.framex = this.spritex + 96 * this.current_frame;
        this.framey = this.spritey;


        // Le perso s'arrete
        if (!(-this.keyboard[0] + this.keyboard[1] != 0 || -this.keyboard[2] + this.keyboard[3] != 0) && this.frame_notmoving < this.time_to_sleep) {
            if (!this.just_stopped) {
                this.current_frame = 0;
                this.just_stopped = 1;
            }
            this.framey += 96;
        }
        else this.just_stopped = 0;


        // Gestion de chat avec un autre joueur
        if (this.talkingTo) index['Chat'] = true
        else delete index['Chat']


        // Gestion de possibilité d'interagir avec qqchose
        if (this.closeTo && !index['Chat']) {
            index['Interraction'] = true
        }
        else delete index['Interraction'];

        if (this.endConv) {
            if (!this.talkingTo) this.endConv = false;
            this.talkingTo = undefined;
            this.waiting = undefined;
            this.closeTo = undefined;
        }
    };

    setSpriteWidth(s) { this.sprite_width = s; }

    refresh() {
        index['CharSelection'] = true;
        delete index['Player'];
        this.die = false;
    }
    // Animation de mort
    die() {
        this.die = true;
    }

    init(s, name) {
        this.name = name;
        this.x = 7488;
        this.y = 8832;
        this.width = 64;
        this.height = 64;

        if (this.name == "Pichu") {
            this.name_color = pokemon_infos["pikachu"][0];
            this.spritepath = "./sprites/pkmns/pichu_3x3.png";

        }
        else {
            this.name_color = pokemon_infos[s][0];
            this.spritepath = "./sprites/pkmns/" + s + "_3x3.png";

        }

        this.max_frame = pokemon_infos[s][1];//((this.sprite_width / 32) / 3)-1;


        index['CharSelection'] = false;
        index['Player'] = true;
        ctx.fillStyle = "black";
    }


};

//Fonction qui dessine un rectangle avec des bouts arrondis
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

export function drawSprite(p) {
    // On dessine le joueur au coordonnées désirées, à la frame voulue, dans la keyboardection voulue
    var sprite = new Image();
    sprite.src = p.spritepath;
    if (player.id == p.id) {
        ctx.drawImage(
            sprite, // Sprite
            p.framex, p.framey, // Position de la frame désirée
            32, 32, // Taille de la frame désirée
            p.shownx, p.showny, // Position voulue
            p.width, p.height // Taille à afficher
        );
    }
    else {
        ctx.drawImage(
            sprite, // Sprite
            p.framex, p.framey, // Position de la frame désirée
            32, 32, // Taille de la frame désirée
            player.shownx + (p.x - player.x), player.showny + (p.y - player.y), // Position voulue
            p.width, p.height // Taille à afficher
        );
    }

}

export function drawNames(p) {
    if (p.width) {
        var tmp_name;
        if (p.was_afk) {
            tmp_name = "[AFK] " + p.name;
        }
        else tmp_name = p.name;

        while (ctx.measureText(p.name).width > 150) {
            ctx.font = ctx.font.replace(/\d+px/, (parseInt(ctx.font.match(/\d+px/)) - 1) + "px");
        }


        // Position du nom en fonction du joueur
        if (player.id == p.id) {

            p.namex = p.shownx + (p.width - ctx.measureText(tmp_name).width) / 2;
            // Fond du texte en transparence et couleur du joueur
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = p.name_color;
            ctx.roundRect(p.namex - 8, p.showny - 18, ctx.measureText(tmp_name).width + 16, 22, 10).fill();

            // Nom du joueur en noir
            ctx.fillStyle = "black";
            ctx.globalAlpha = 1.0;
            ctx.fillText(tmp_name, p.namex, p.showny);

            ctx.font = "25px Triakis";
        }
        else {
            p.namex = player.shownx + (p.x - player.x) + (p.width - ctx.measureText(tmp_name).width) / 2;
            // Fond du texte en transparence et couleur du joueur
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = p.name_color;
            ctx.roundRect(p.namex - 8, player.showny + (p.y - player.y) - 18, ctx.measureText(tmp_name).width + 16, 22, 10).fill();

            // Nom du joueur en noir
            ctx.fillStyle = "black";
            ctx.globalAlpha = 1.0;
            ctx.fillText(tmp_name, p.namex, player.showny + (p.y - player.y));

            ctx.font = "25px Triakis";
        }
    }


}
export function checkForPlayers(p1, p2) {


    if (!p2.was_afk) // Cas ou le joueur en face n'est pas AFK
    {
        let xdiff = (p1.x - p2.x) * (p1.x - p2.x)
        let ydiff = (p1.y - p2.y) * (p1.y - p2.y)

        if (Math.sqrt(xdiff + ydiff) < 50) {
            // Savoir si on est proche de qqun
            if (!player.closeTo && !p2.talkingTo && !player.cancelledtalk) {
                player.closeTo = p2.id;
                interBox.txt = "Appuyez sur 'Entrée' pour parler avec " + p2.name;

            }

            if (keyboard['x'] && p2.waiting == player.id) {
                player.cancelledtalk = true;
                interBox.txt = "Vous avez annulé la conversation..."
            }
            if (p2.cancelledtalk || (p2.talkingTo && p2.talkingTo != player.id)) {
                interBox.txt = "Ouch ! " + p2.name + " a refusé la conversation..."
            }
            if (player.closeTo == p2.id && keyboard['Enter'] == !player.cancelledtalk) {
                if (p2.waiting == player.id) {
                    player.talkingTo = p2.id;
                    player.talkingName = p2.name;
                    player.waiting = undefined;
                }
                else {
                    player.waiting = player.closeTo;
                    interBox.txt = "En attente de " + p2.name + "...";
                }
            }

            if (p2.waiting == player.id && !player.cancelledtalk) {
                interBox.poke = true;
                interBox.txt = p2.name + " veut vous parler !";
            }
            if (player.cancelledtalk) interBox.poke = false;
            if (p2.talkingTo == player.id) {
                player.talkingTo = p2.id;
                player.talkingName = p2.name;
                player.waiting = undefined;
                interBox.poke = false;
            }
        }
        else if (player.closeTo == p2.id) // Cas ou on s'éloigne
        {
            player.closeTo = undefined;
            player.talkingTo = undefined;
            player.waiting = undefined;
            player.cancelledtalk = false;
            interBox.poke = false;
        }
    }
    else // Cas ou le joueur en face est AFK
    {
        player.closeTo = undefined;
        player.talkingTo = undefined;
        player.waiting = undefined;
    }

    if (p2.endConv) {
        player.closeTo = undefined;
        player.talkingTo = undefined;
        player.waiting = undefined;
    }

}

export const player = new Player();

