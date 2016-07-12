var thickness = 50;
var button = 0;
// var vibVal = 0;
var tw1Count = 0;
var tw2Count = 0;
var circle = [];
var k1 = "";
var k2 = "";
var lines = [];
var submitted = false;

// socket will listen for the data from the hardware components and twitter
var socket = io.connect('//localhost:3000');

// socket.on('data', function(data) {

//     potVal = data.val;
// });

// socket.on('btn', function(btn) {

//     button = btn.val;
// });

// socket.on('vib', function(vib) {

//     vibVal = vib.val;
// });

// http://www.adomas.org/javascript-mouse-wheel/
function handle(delta) {
    console.log(delta);
    if (delta < 0){
        thickness--;
        if(thickness < 2){
            thickness = 2;
        }
    }
    else{
        thickness++;
        if(thickness > 50){
            thickness = 50;
        }
    }
}

function wheel(event){
    var delta = 0;
    if (!event) event = window.event;
    if (event.wheelDelta) {
        delta = event.wheelDelta/120; 
    } else if (event.detail) {
        delta = -event.detail/3;
    }
    if (delta)
        handle(delta);
        if (event.preventDefault)
                event.preventDefault();
        event.returnValue = false;
}

if (window.addEventListener)
    window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;
//--------------------------------------------- 

// when there's a tweet that contains the keyword, push it into array of Line
socket.on('tw1', function(tw1) {
    tw1Count++;
    lines.push(new Line());
    lines[lines.length - 1].randX();
    lines[lines.length - 1].setText(tw1.text);
    lines[lines.length - 1].setY();
    lines[lines.length - 1].r = 253; 
    lines[lines.length - 1].g = 0; 
    lines[lines.length - 1].b = 76; 

});

socket.on('tw2', function(tw2) {
    tw2Count++;
    lines.push(new Line());
    lines[lines.length - 1].randX();
    lines[lines.length - 1].setText(tw2.text);
    lines[lines.length - 1].setY();
    lines[lines.length - 1].r = 0; 
    lines[lines.length - 1].g = 237; 
    lines[lines.length - 1].b = 192;

});

function setup(){
    createCanvas(windowWidth,windowHeight);
    circle = new Circle();
}

function draw(){
    console.log()
    background(6,17,28);
    
    // when having more than 0 line, draw in through for loop
    if(lines.length > 0){
        for(var i=0;i<lines.length;i++){
            //var val = map(potVal, 0, 1023, 2, 50);

            // setStroke(val) is to set the thickness of lines (value from potentiometer)
            lines[i].setStroke(thickness);
            lines[i].appear();
            lines[i].fall();
            lines[i].checkGround();
                        
        }
    }

    noStroke();
    textSize(48);
    fill(color(230,229,226,255));
    textFont('Exo');
    textStyle(THIN);
    text("MOST TWEETED WORD", 50, windowHeight-150);

    // when hover over each line, print out a tweet
    if(lines.length > 0){
        for(var i=0;i<lines.length;i++){
            if(lines[i].mouseOn()){
                lines[i].drawText();
            }
            else{
                // mouse out
            }
        }
    }

    // handle vibration sensor
    // if(vibVal < 500){
    //     lines.splice(0,lines.length);
    //     tw1Count = 0;
    //     tw2Count = 0;
    // }

    // handle button press
    if(button == 1){
        background(0,0,0,150);           
        circle.appear(tw1Count, tw2Count);
    }

    // draw graph legend
    if(submitted){
        noStroke();
        fill(20,20,30,127);
        rect(windowWidth-300,windowHeight-225,250,175);
        fill(color(253,0,76,255));
        ellipse(windowWidth-250,windowHeight-175,50,50);
        textSize(16);
        textFont('Raleway');
        textStyle(NORMAL);
        text(k1, windowWidth-200, windowHeight-170);
        fill(color(0,237,192,255));
        ellipse(windowWidth-250,windowHeight-100,50,50);
        text(k2, windowWidth-200, windowHeight-95);  
    }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed(){
    if(keyCode == ESCAPE){
        lines.splice(0,lines.length);
        tw1Count = 0;
        tw2Count = 0;
        socket.emit('re',true);
        location.reload();
    }
    if(keyCode == BACKSPACE || keyCode == DELETE){
        console.log("delete");
    }
}

function mousePressed(){
    button = 1;
}

function mouseReleased(){
    button = 0;
}

// handle refresh window
function checkFirstVisit() {
  if(document.cookie.indexOf('mycookie')==-1) {
    // cookie doesn't exist, create it now
    document.cookie = 'mycookie=1';
  }
  else {
    // not first visit
    lines.splice(0,lines.length);
    tw1Count = 0;
    tw2Count = 0;
    socket.emit('re',true);
  }
}

// ********** Line Class **********

function Line(){
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.w = 2;
    this.r = 255;
    this.g = 255;
    this.b = 255;
    this.a = 127;
    this.speed = 4;
    this.isOnGround = false;
    this.text = "";
    this.lengthMultiplier = 3;
}

Line.prototype.randX = function(){
    this.x1 = random(0,windowWidth);
    this.x2 = this.x1; 
}

Line.prototype.randY = function(){
    this.destinatonY = random(0,windowHeight);
}

Line.prototype.setY = function(){
    this.destinatonY = this.text.length * this.lengthMultiplier;
}

Line.prototype.setStroke = function(val){
    this.w = val;
}

Line.prototype.setText = function(text){
    this.text = text;
}

Line.prototype.appear = function(){
    strokeWeight(this.w);
    stroke(this.r,this.g,this.b,this.a);
    line(this.x1,this.y1,this.x2,this.y2);
}

Line.prototype.fall = function(){
    this.y2 += this.speed;
}

Line.prototype.checkGround = function(){
    if(this.y2 >= this.destinatonY){
        this.speed = 0;
        this.isOnGround = true;
    }
}

Line.prototype.mouseOn = function(){
    if(mouseX > this.x2-(this.w/2) && mouseX < this.x2+(this.w/2) && mouseY < this.y2){
        this.a = 255; 
        return true;
    }
    else{
        this.a = 127;
        return false;
    }
}

Line.prototype.drawText = function(){
    textSize(14);
    fill(230,229,226,255);
    noStroke();
    textFont('Raleway');
    textStyle(THIN);
    text(this.text,50,windowHeight-100);
}

Line.prototype.getText = function(){
    return this.text;
}

// ********** Circle Class **********

function Circle(){
    this.r1 = 50;
    this.r2 = 50;
    this.x = windowWidth/2;
    this.y = windowHeight/2;
    this.c1 = color(253,0,76,255);
    this.c2 = color(0,237,192,255)
}

Circle.prototype.appear = function(r1,r2){

    this.r1 = r1;
    this.r2 = r2;
        if(this.r1 > this.r2){
        fill(this.c1);
        noStroke();
        ellipseMode(CENTER);
        ellipse(this.x,this.y,this.r1,this.r1);

        fill(this.c2);
        noStroke();
        ellipseMode(CENTER);
        ellipse(this.x,this.y,this.r2,this.r2);
    }
    else{
        fill(this.c2);
        noStroke();
        ellipseMode(CENTER);
        ellipse(this.x,this.y,this.r2,this.r2);
        
        fill(this.c1);
        noStroke();
        ellipseMode(CENTER);
        ellipse(this.x,this.y,this.r1,this.r1); 
    }
}

// jQuery handle form submit

jQuery.noConflict();
jQuery(document).ready(function(){
    //jQuery('#info').hide();
    // jQuery('#info-icon').mouseover(function(){
    //     jQuery('#info').fadeIn(1000);
    // });
    // jQuery('#info-icon').mouseout(function(){
    //     jQuery('#info').fadeOut(1000);
    // });
    jQuery('#info-icon').mouseover(function(){
        //jQuery('#info').show();
        jQuery('#info').removeClass('hide-first-time');
        jQuery('#info').addClass('show');
        jQuery('#info').removeClass('hide');
    });
    jQuery('#info-icon').mouseout(function(){
        jQuery('#info').addClass('hide');
        jQuery('#info').removeClass('show');
    });
    jQuery('#submit').click(function(e){
        e.preventDefault();
        k1 = document.getElementById('keyword-1').value;
        k2 = document.getElementById('keyword-2').value;
        if(k1 != "" && k2 != ""){
            submitted = true;
            //var socket = io();
            socket.emit('key1',k1);
            socket.emit('key2',k2);

            jQuery('#bg').slideUp('slow',function(){

                jQuery('#warning-msg').addClass('hidden');
            });
        }
        else{
            // alert something
            jQuery('#warning-msg').removeClass('hidden');
        }
    });
});