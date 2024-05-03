const DIR_LEFT  = 0;
const DIR_UP    = 1;
const DIR_RIGHT = 2;
const DIR_DOWN  = 3;


function hide_menu(){
    document.getElementById('main-menu').classList.add('main-menu--hide');
}
function show_menu(){
    document.getElementById('main-menu').classList.remove('main-menu--hide');
}


function hide_end_game_menu(){
    document.getElementById('end-game-menu').classList.add('end-game--hide');
}
function show_end_game_menu(){
    document.getElementById('end-game-menu').classList.remove('end-game--hide');
}


function from_end_game_to_menu(){
    hide_end_game_menu();
    show_menu();
}


function initialise(){
    var canvas = document.getElementById('canvas').getContext('2d');
    
    this.scores = 0;

    this.movePause = 250;
    this.startTime = new Date().getTime();

    this.ctx = canvas;

    canvas.width = 800;
    canvas.height = 600;
    
    this.frameTime = 1000/60;
    
    this.grid = new Grid(800, 600, 20);

    this.gameStart = true;

    this.gameCicle = setInterval(() => frame() ,this.frameTime);
}


function start_menu_onclick(){
    initialise();
    hide_menu();
    document.onkeydown = document.onkeyup = key_handler;
}


function quit(){
    nw.App.quit();
}



function key_handler(e){
    if(gameStart){

        if(e.code == 'ArrowLeft'){
            if(e.type == 'keyup' && grid.snake.direction != DIR_RIGHT){
                grid.snake.direction = DIR_LEFT;
            }
        }else if(e.code == 'ArrowRight' && grid.snake.direction != DIR_LEFT){
            if(e.type == 'keyup'){
                grid.snake.direction = DIR_RIGHT;
            }
        }else if(e.code == 'ArrowUp' && grid.snake.direction != DIR_DOWN){
            if(e.type == 'keyup'){
                grid.snake.direction = DIR_UP;
            }
        }else if(e.code == 'ArrowDown' && grid.snake.direction != DIR_UP){
            if(e.type == 'keyup'){
                grid.snake.direction = DIR_DOWN;
            }
        }
    }
}
    





function end_game(){
    console.log('endGame');
    clearInterval(gameCicle);
    document.getElementById('scores').innerText = scores+'';
    show_end_game_menu();
}




function frame(){
    time = new Date().getTime();
    if (movePause <= time - startTime){
        startTime = time;
        grid.snake.move();
    }

    ctx.clearRect(0, 0, 800, 600)
    grid.draw();
}



class Node{
    constructor(prev, data, next=null){
        this.prev = prev;
        this.data = data;
        this.next = next;
    }
}

class Snake{
    constructor(x, y, length){
        this.direction = DIR_DOWN;
        
        this.x = x;
        this.y = y;

        this.length = length;

        this.head = new Node(null,[x,y]);
        var currNode = this.head;
        for (var i = 0; i < length - 1; i++){
            var node = new Node(currNode, [currNode.data[0], currNode.data[1]-1]);
            currNode.next = node;
            currNode = node;
        }
    }
    

    set_pos(x, y){
        if(grid.width - 1 < x ){
            x = 0;
        }else if(x < 0){
            x = grid.width;
        }

        if(grid.height - 1 < y ){
            y = 0;
        }else if(y < 0){
            y = grid.height;
        }


        var prevData = this.head.data;

        this.head.data = [x, y];
        
        var node = this.head.next;
        while (true) {
            var nodeData = node.data;

            node.data = prevData;    

            prevData = nodeData;
            
            node = node.next;

            if (node == null)
                break
        }
    }

    move(){
        if(this.direction == DIR_DOWN){
            var x = this.head.data[0];
            var y = this.head.data[1] + 1;
            this.set_pos(x, y);
        }else if(this.direction == DIR_UP){
            var x = this.head.data[0];
            var y = this.head.data[1] - 1;
            this.set_pos(x, y);
        }else if(this.direction == DIR_LEFT){
            var x = this.head.data[0] - 1;
            var y = this.head.data[1];
            this.set_pos(x, y);
        }else if(this.direction == DIR_RIGHT){
            var x = this.head.data[0] + 1;
            var y = this.head.data[1];
            this.set_pos(x, y);
        }

        if(grid.apple[0] == this.head.data[0]){
            if(grid.apple[1] == this.head.data[1]){
                console.log(1);
                this.add_node();
                grid.new_apple();

                movePause -= 20;
                if(movePause < 100)
                    movePause = 100;
            }
        }

        var node = this.head.next;
        while (true){
            if(node != null){
                if(node.data[0] == this.head.data[0])
                    if(node.data[1] == this.head.data[1])
                        end_game();

                node = node.next;
            }
            else
                break;
        }
    }

    add_node(){
        this.length++;

        scores++;

        var node = this.head.next;
        while (true){
            if(node.next != null)
                node = node.next
            else
                break;
        }

        var x = node.data[0] - node.prev.data[0];
        var y = node.data[1] - node.prev.data[1];
        
        if(x == 0){
            if (y > 0)
                node.next = new Node(node, [node.data[0], node.data[1] - 1]);
            else
                node.next = new Node(node, [node.data[0], node.data[1] + 1]);
        }else{
            if(x > 0)
                node.next = new Node(node, [node.data[0] - 1, node.data[1]]);
            else
                node.next = new Node(node, [node.data[0] + 1, node.data[1]]);
        }
    }
}

class Grid{
    constructor(width, height, cellSize){
        this.width = width/cellSize;
        this.height  = height/cellSize;
        
        this.cellSize = cellSize;

        this.snake = new Snake(10, 10, 5);

        this.apple = [5, 5];
    }

    draw_line(x1, y1, x2, y2, clr){
        ctx.strokeStyle = clr;
        ctx.lineWidth = 1;/////////

        ctx.beginPath();
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
        ctx.stroke();
    }

    draw_grid(){
        
        var x1, x2, y1, y2 = 0;
        y1 = 0;
        y2 = this.height * this.cellSize;
        for (var i = 0; i <= this.width; i += 1){
            x1 = x2 = i * this.cellSize;
            this.draw_line(x1, y1, x2, y2, '#232323');
        }

        x1 = 0;
        x2 = this.width * this.cellSize;
        for (var j = 0; j <= this.height; j += 1){ 
            y1 = y2 = j*this.cellSize;           
            this.draw_line(x1, y1, x2, y2, '#232323');
        }

    }

    draw_cell(x, y, clr){
        ctx.beginPath();
        ctx.rect(x * this.cellSize, y * this.cellSize, this.cellSize,this.cellSize);
        ctx.fillStyle = clr;
        ctx.fill();
    }

    draw_snake(){

        var node = this.snake.head;
        var x,y = 0;

        x = node.data[0];
        y = node.data[1];
        
        this.draw_cell(x,y,'#AAA');
        
        node = node.next;
        while (true){

            x = node.data[0];
            y = node.data[1];
            
            this.draw_cell(x,y,'#FFF');
            
            node = node.next;

            if(node == null)
                break;
        }

    }

    draw(){
        this.draw_cell(this.apple[0], this.apple[1], '#b91f1f');
        this.draw_snake();
        this.draw_grid();

    }

    new_apple(){
        var snake_cells = [];
        var node = this.snake.head;
        while(true){
            snake_cells.push([node.data[0], node.data[1]]);
            
            node = node.next;
            if(node == null)
                break;
        }


        var cells = [];
        for (var i = 0; i < this.width; i++){
            for (var j = 0; j < this.height; j++){
                for (var t = 0; t < snake_cells.length; t++){
                    if(snake_cells[t][0] == i && snake_cells[t][1] == j)
                        continue;
                    else
                        cells.push([i, j]);
                }
            }
        }


        var newPos = cells[Math.floor(Math.random() * cells.length)];
        this.apple = newPos;
    }
}
