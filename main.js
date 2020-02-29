//Initialize canvas for drawing

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//Initialize crutial game values

tickSpeed = 125; // How many MS it takes for the game to do one loop
isRunning = false; //Is the game currently running?
isPaused = false; //Is the game paused?

//The player Object and all its revelent variables and functions

var player = {
    x: -25, //Set to -25 because of bug where starting pos has +25 to it
    y: 25, //Set to 25 because of the GUI
    //Snake's current direction of travel incase no key is pressed in time for new frame
    up: false,  
    left: false,
    right: true,
    down: false,
    currentColor: 'green',
    //Rainbow Mode O-O
    rainbow: false,
    //Length of snake's trail AKA score
    length: 0,
    //Am i alive?
    dead: false,
    draw: function() { //Function to draw snake's head
        ctx.fillStyle = player.currentColor;
        ctx.fillRect(this.x + 2, this.y + 2, 21, 21); 
    },
    updateKeys: function(keyList) { //Function to update the snake's direction of travel if a new key has been pressed. It also toggles rainbow mode. It handles keys, its a key handler.

        if (keyList[82]) {
            if (player.rainbow)
                player.rainbow = false
            else
                player.rainbow = true;
        }

        if (keyList[87] || keyList[38]) {
            player.up = true;
            player.down = false;
            player.left = false;
            player.right = false;
        }
        if (keyList[83] || keyList[40]) {
            player.up = false;
            player.down = true;
            player.left = false;
            player.right = false;
        }
        
        if (keyList[65] || keyList[37]) {
            player.up = false;
            player.down = false;
            player.left = true;
            player.right = false;
        }
    
        if (keyList[68] || keyList[39]) {
            player.up = false;
            player.down = false;
            player.left = false;
            player.right = true;
        }

    },
    updatePos: function() { //Responsible for moving the snake every frame and checking collisions with the edge and tail. also draws and updates the player's tail.
        //Player tail
        playerTrail.push({x:player.x, y:player.y});

        ctx.fillStyle = "green";
        if (player.rainbow)
            ctx.fillStyle = player.currentColor;
        ctx.fillRect(player.x + 2, player.y + 2, 21, 21);
        
        while (playerTrail.length > player.length) {
            ctx.fillStyle = "black";
            ctx.fillRect(playerTrail[0].x, playerTrail[0].y, 25, 25);
            playerTrail.shift();
        }
        
        //Change color if rainbow mode is on
        if (player.rainbow)
            player.currentColor = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
        else
            player.currentColor = 'green';
        
        //Move Player
        if (player.up)
            player.y -= 25;

        if (player.down)
            player.y += 25;

        if (player.left)
            player.x -= 25;

        if (player.right)
            player.x += 25;

        //Check Collissions With Tail

        for (j = 0; j < playerTrail.length; j++) {
            if (playerTrail[j].x == player.x && playerTrail[j].y == player.y) 
                player.dead = true;
        }

        //Collision Checking With Edge of Screen

        if (player.x > 525 - 25) {
            player.dead = true;
        }
        if (player.x < 0) {
            player.dead = true;
        }
        if (player.y < 25) {
            player.dead = true;
        }
        if (player.y > 550 - 25) {
            player.dead = true;
        }
    }
}

var playerTrail = [];   //all the X and Y coords of the snake's trail


//The food pellet X and Y values
var food = {
    x: (Math.floor(Math.random() * 21) * 25) + 7.5,
    y: ((Math.floor(Math.random() * 21) + 1) * 25) + 7.5
};

var pressedKeys = [];   //All the currently pressed keys


//Function to Draw and Handle Collissions regarding to food pellets.
function foodHandler() {
    ctx.fillStyle = "orange";
    ctx.fillRect(food.x, food.y, 10, 10);  
    if (player.x < food.x + 10 && 
        player.x + 25 > food.x &&
        player.y < food.y + 10 &&
        player.y + 25 > food.y) {
            player.length++;
            food = {
                x: (Math.floor(Math.random() * 21) * 25) + 7.5,
                y: ((Math.floor(Math.random() * 21) + 1) * 25) + 7.5
            };
        for (var o = 0; o < player.length-1; o++) {
               if (playerTrail[o].x < food.x + 10 && 
                playerTrail[o].x + 25 > food.x &&
                playerTrail[o].y < food.y + 10 &&
                playerTrail[o].y + 25 > food.y) { 
                    food = {
                       x: (Math.floor(Math.random() * 21) * 25) + 7.5,
                       y: ((Math.floor(Math.random() * 21) + 1) * 25) + 7.5
                    };
               }
        }
    }
}

//Manage the pressed keys list.
function keys(key) {
    if (key.keyCode == 83 && !isRunning) {
        startGame();
    }
    if (key.keyCode == 27 && key.type == "keydown") {
        if (!isPaused) {
            isPaused = true;
        } else if (isPaused) {
            isPaused = false;
        }
    }
    
    if (key.keyCode == 82 && key.type == "keyup" && isRunning == false && player.dead == true) { //restart game from gameover screen
      //Reset all game variables        
        player.x = 0;
        player.y = 0;
        player.up = false;
        player.down = true;
        player.left = false;
        player.right = false;
        player.currentColor = 'green';
        player.rainbow = false;
        player.length = 0;
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,525,550);
        ctx.font = '25px Arial';
        ctx.textAlign = "left";

        isPaused = false;
        player.dead = false;
        
        isRunning = true;
    }
    switch(key.type) {
        case "keyup":
            delete pressedKeys[key.keyCode];
            player.updateKeys(pressedKeys);        
            break;
        case "keydown":
            pressedKeys[key.keyCode] = true;
            player.updateKeys(pressedKeys);
            break;
    }
}

function render() {
    if (!player.dead) {
        //If the game is not paused, update stuff
        if (!isPaused) {
            foodHandler();   
            player.updatePos(pressedKeys);
        }
        
        player.draw(); //Draw player on screen
        
        //Draw GUI background
        ctx.fillStyle = '#04044f';
        ctx.fillRect(0,0,525,25);
        ctx.fillStyle = 'white';
        
        //Draw score in GUI
        ctx.fillText("Score: " + player.length, 10, 20);

        //Draw rainbow icon in GUI
        if (player.rainbow) {
            ctx.fillStyle = 'crimson';
            ctx.fillText("R", 400, 20);
            ctx.fillStyle = 'yellow';
            ctx.fillText("a", 417, 20);
            ctx.fillStyle = 'orange';
            ctx.fillText("i", 432, 20);
            ctx.fillStyle = 'purple';
            ctx.fillText("n", 438, 20);
            ctx.fillStyle = 'aqua';
            ctx.fillText("b", 451, 20);
            ctx.fillStyle = 'darkgoldenrod';
            ctx.fillText("o", 465, 20);
            ctx.fillStyle = 'lawngreen';
            ctx.fillText("w", 479, 20);
        }

        if (isPaused) {
            ctx.fillStyle = 'aqua';
            ctx.fillText("Paused!", 290, 20);
        }

        //Draw Screen Edges
        ctx.fillStyle = 'red';
        ctx.fillRect(0,0,2,550);
        ctx.fillRect(0,548,525,2);
        ctx.fillRect(524,0,2,550);
        ctx.fillRect(0,25,525,1);

       
    } else {
        //Check highscore and compare
        
        if (localStorage.getItem("highScore") !== null) {
            if (localStorage.getItem("highScore") < player.length) {
                localStorage.setItem("highScore", player.length);   
            }
        } else {
            localStorage.setItem("highScore", player.length);  
        }
        
        //Game over Screen
        isRunning = false;
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,525,550);
        ctx.fillStyle = 'red';
        ctx.textAlign = "center";
        ctx.font = '50px Arial';
        ctx.fillText("Game Over!", 525/2, 550/4);
        ctx.fillStyle = 'forestgreen';
        ctx.font = '30px Arial';
        ctx.fillText("Score: " + player.length, 525/2, 550/3 + 50);
        ctx.font = '20px Arial';
        ctx.fillText(((player.length / 625) * 100).toFixed(2) + "% complete", 525/2, 550/3 + 90);
        ctx.fillStyle = 'purple';
        ctx.fillText("Highscore: " + localStorage.getItem("highScore") + " " + ((localStorage.getItem("highScore") / 625) * 100).toFixed(2) + "%", 525/2, 550/2+40);
        ctx.fillStyle = 'skyblue';
        ctx.fillText("Press 'R' to play again!", 525/2, 530);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'green';

        ctx.fillText('SnAkE+', 525/2, 50);
    }
    
}

document.addEventListener("keydown", keys, null);
document.addEventListener("keyup", keys, null);

//Start game message

ctx.fillStyle = 'black';
ctx.fillRect(0,0,525,550);

ctx.font = '30px Arial';
ctx.fillStyle = 'green';
ctx.textAlign = "center";

ctx.fillText('SnAkE+', 525/2, 50);
ctx.fillStyle = 'white';
ctx.fillText("Press S to start the game!", 525/2, 200);
ctx.fillText("Use WASD or the Arrow Keys to move.", 525/2, 250);
ctx.fillText("Press 'R' to toggle rainbow mode.", 525/2, 300);
ctx.fillText("Use 'ESC' to pause.", 525/2, 350);
ctx.font = '10px Arial';
ctx.fillText("© 2020 Heydin Anderson | All Rights Reserved", 525/2, 540);

//Start-Game function 

function startGame() {

    //Set Initial background because the background is NOT re-drawn every loop

    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,525,550);

    //Set font for score display

    ctx.font = '25px Arial';
    ctx.textAlign = "left";

    isRunning = true;

    render();
    window.setInterval(function() {
        render();
    }, tickSpeed);
}


