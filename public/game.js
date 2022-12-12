import { CharSelection } from './char_selection.js';
import {  mouseReset, deleteKeyInput , cleanKeyboard } from './keys.js'

//import { player, drawSprite, drawNames, checkForPlayers } from './player.js';
import * as Player from './player.js';
import {chatBox, interBox, connectBox, dcBox, otherBox} from './chatbox.js';
import { map } from './map.js';

const canvas = document.getElementById("cv");
const ctx = canvas.getContext('2d');

const socket = io();

//var txtExemple="(10:01) Yannis : Salut mec ! Comment ça va ?\n(10:02) Yannis n°2 : Mec je comprends rien c'est quoi le but du jeu ??\n(10:07) Yannis : Bah y en a pas je crois...\n(10:01) Yannis : Salut mec ! Comment ça va ?\n(10:02) Yannis n°2 : Mec je comprends rien c'est quoi le but du jeu ??\n(10:07) Yannis : Bah y en a pas je crois...\n(10:01) Yannis : Salut mec ! Comment ça va ?\n(10:02) Yannis n°2 : Mec je comprends rien c'est quoi le but du jeu ??\n(10:07) Yannis : Bah y en a pas je crois...\n"
// Variable importante qui permet de gérer dans quel cas on est et ce que l'on doit afficher.
var index = {
    'CharSelection': true,
    'Player': false,
    'Chat': false,
    'Interraction' : false,
}


export { socket, index }

let players = [];
var id_received
var texts_received
const select = new CharSelection();


socket.on('players list', function (list, afks, texts, id, newcomer) {

    
    players = list;
    afks.forEach(function(p)
    {
        if(p==Player.player.id)
        {
            Player.player.was_afk = true
            socket.emit('not afk', p)
        }     
    }
    )
    id_received = id;
    texts_received = texts;

    if(newcomer)
    {
        connectBox.addTexts(newcomer)
    }
});
;


socket.on('link id', function (id) {
    Player.player.id = id;
});



function movePlayer() {
    Player.player.update();
    socket.emit('update player', Player.player);

    // On check qui est proche de qui pour tout le monde.
    players.forEach(function (p) {
        if((p.id!=Player.player.id))
        {
            Player.checkForPlayers(Player.player,p);
        }
        if(id_received == p.id)
        {
            chatBox.getLines(texts_received);
        }
        
    });

    // Si jamais la personne proche se déconnecte, on veut réinitialiser les données.
    if (!players.some(e => e.id === Player.player.closeTo)) {
        Player.player.closeTo = undefined;
        Player.player.talkingTo = undefined;
        Player.player.waiting = undefined;

        chatBox.clean()
    }
        
}

function drawPlayers() {

    //socket.emit('update player', Player.player);
    players.forEach(function (player) {
        Player.drawSprite(player);
    });
}

function drawNames() {
    players.forEach(function (player) {
        Player.drawNames(player);
        dcBox.draw();
        otherBox.draw();
    });

}


function update() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.drawLayers(true);



    
    if (index['Player']) {
        drawPlayers();
        movePlayer(); 
    }

    map.drawLayers(false);
    //map.seeHitboxes()


    if (index['Player']) {
        drawNames();
        connectBox.draw();
    }

    if (index['Chat']) {
        chatBox.update();
        chatBox.draw();

    }
    if (index['Interraction']) {
        interBox.draw();
    }

    if (index['CharSelection']) {
        select.update();
        select.draw();
    }

    // On reset quelques variables.
    deleteKeyInput();
    cleanKeyboard();
    mouseReset();
    requestAnimationFrame(update);
}
requestAnimationFrame(update);

