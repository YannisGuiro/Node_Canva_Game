const canvas = document.getElementById("cv");
const ctx = canvas.getContext('2d');
import { interBox, otherBox } from './chatbox.js';
import { keyboard } from './keys.js'
import { player } from './player.js';

var data
readTextFile("./sprites/maps/map.json", function (text) {
    data = JSON.parse(text);
});
class Map {
    constructor() {
        this.path = "./sprites/maps/map.json";
        this.tileAtlas = new Image();
        this.tileAtlas.src = "./sprites/maps/tileset.png";

        this.tileSize = 32;
        this.tileOutputSize = 2 // can set to 1 for 32px or higher
        this.updatedTileSize = this.tileSize * this.tileOutputSize;

        this.atlasCol = 8;
        this.atlasRow = 542;
        this.mapCols = 150;
        this.mapRows = 150;
        this.mapHeight = this.mapRows * this.tileSize;
        this.mapWidth = this.mapCols * this.tileSize
    }


    seeHitboxes() {
        if (data) {

            //console.log(data.layers[0])
            let mapIndex = 0;
            //console.log("x : ", x, ", y : ", y)
            for (let col = 0; col < this.mapHeight; col += this.tileSize) {
                for (let row = 0; row < this.mapWidth; row += this.tileSize) {
                    let tileVal = data.layers[5].data[mapIndex];
                    if (tileVal != 0) {
                        let col2 = col * 2
                        let row2 = row * 2
                        ctx.fillStyle = "red"
                        ctx.rect(col2, row2, this.updatedTileSize, this.updatedTileSize)
                        ctx.fill();
                    }
                }
                mapIndex++;

            }


        }
    }



    drawLayers(l) {
        // Cette fonction n'est pas optimale duu tout. Le script overall ne l'est pas, mais on dessine beaucoup trop de sprites...
        if (data) {
            var start
            var end
            if (l) {
                start = 0;
                end = 2;
            }
            else {
                start = 3
                end = 4;
            }

            for (let i = start; i <= end; i++) {
                //console.log(data.layers[0])
                let mapIndex = 0;
                let sourceX = 0;
                let sourceY = 0;

                let bonus = data.tilesets[1].firstgid
                for (let col = 0; col < this.mapHeight; col += this.tileSize) {
                    for (let row = 0; row < this.mapWidth; row += this.tileSize) {
                        let tileVal = data.layers[i].data[mapIndex];
                        if (tileVal != 0) {
                            tileVal -= bonus;
                            sourceY = Math.floor(tileVal / this.atlasCol) * this.tileSize;
                            sourceX = (tileVal % this.atlasCol) * this.tileSize;

                            // On ne le dessine que si il est visible, donc on regarde la position par rapport à la position du joueur dans la carte. Important sinon le script tourne trop lentment
                            if (((row * this.tileOutputSize < player.x + 450) && 
                            (row * this.tileOutputSize > player.x - 450)) && 
                            (col * this.tileOutputSize < player.y + 350) && 
                            (col * this.tileOutputSize > player.y - 350)) // On prend 350 et 450 par sureté. C'est un peu plus de la moitié de l'écran.
                                ctx.drawImage(this.tileAtlas, sourceX, sourceY, this.tileSize,
                                    this.tileSize, (row * this.tileOutputSize) + (player.shownx - player.x), (col * this.tileOutputSize) + (player.showny - player.y),
                                    this.updatedTileSize, this.updatedTileSize);
                            /*console.log(this.tileAtlas,sourceX, sourceY, this.tileSize,
                                this.tileSize, row * this.tileOutputSize, col * this.tileOutputSize,
                                this.updatedTileSize, this.updatedTileSize)*/
                        }
                        mapIndex++;
                    }
                }
            }
        }
    }

    checkCollisions(x, y, width) {
        if (data) {
            let mapIndex = 0;

            var p = { x: x + 20, y: y + 45, width: 24, height: 10 }
            /*ctx.fillStyle = "red"
            ctx.rect(p.x,p.y,p.width,p.height)
            ctx.fill()*/
            var hb;
            for (let col = 0; col < this.mapHeight; col += this.tileSize) {
                for (let row = 0; row < this.mapWidth; row += this.tileSize) {
                    let tileVal = data.layers[5].data[mapIndex];
                    if (tileVal != 0) {
                        let col2 = col * 2
                        let row2 = row * 2

                        hb = { x: row2, y: col2, width: this.updatedTileSize, height: this.updatedTileSize }


                        if (isCollide(p, hb)) {
                            tileVal--;
                            switch(tileVal)
                            {
                                case 1:
                                    console.log(1)
                                    otherBox.msg = "Work in progress...";
                                    return
                                case 2:
                                    player.move(1410,8000)
                                    return
                                case 3:
                                    return
                                case 9:
                                    otherBox.msg = "Map par Yannis Guironnet !";
                                    return
                                case 11:
                                    player.die = true;
                                    return
                                case 14:
                                    player.move(8256,7296)
                                    return
                                case 15:
                                    return true;

                            }
                        }


                    }
                    else{
                        otherBox.msg = undefined
                    }
                    mapIndex++;

                }
            }
        }

    }
}
export const map = new Map();

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function isCollide(a, b) {
    return !(
        ((a.y + a.height) < (b.y)) ||
        (a.y > (b.y + b.height)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width))
    );
}