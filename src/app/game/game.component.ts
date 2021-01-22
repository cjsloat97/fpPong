import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  private canvas: any;
  private game: any;
  private ctx: any;
  private soundLeft: any;
  private soundRight: any;
  private soundWall: any;
  private gameTimeLast: any;

  constructor() { }

  ngOnInit(): void {
    this.gameTimeLast = new Date();
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.soundLeft = document.getElementById("bounceLeft");
    this.soundRight = document.getElementById("bounceRight");
    this.soundWall = document.getElementById("bounceWall");

    this.game = {
      player: {
        y: this.canvas.height / 2,
        score: 0
      },
      computer: {
        y: this.canvas.height / 2,
        score: 0,
        speed: 2
      },
      ball: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: Math.round(Math.random()) ? 1 : -1,
        vy: Math.random() * 4 - 2,
        bounces: 0,
        radius: 3,
        reset: function (canvas: any) {
          this.x = canvas.width / 2;
          this.y = canvas.height / 2;
          this.vy = Math.random() * 4 - 2;
        },
        multiplier: .2,
        maxspeed: 5
      },
      playerHeight: 80,
      playerWidth: 4,
      pause: false,
      sound: true
    };

    document.onmousemove = this.moveMouse;

    this.update();
  }

  changeBallDirection(player: { y: number; }) {
    if(player.y > this.game.ball.y)
      this.game.ball.vy -= (player.y - this.game.ball.y) / this.game.playerHeight * this.game.ball.maxspeed;
    else if(player.y < this.game.ball.y)
      this.game.ball.vy += (this.game.ball.y - player.y) / this.game.playerHeight * this.game.ball.maxspeed;
  
    this.game.ball.vx *= -1;
  }

  playSound(snd: { paused: any; pause: () => void; currentTime: number; play: () => void; }) {
    if(this.game.sound) {
      try {
        if (!snd.paused) {
          // Pause and reset it
          snd.pause();	
          snd.currentTime = 0;
        }
        snd.play();
      }
      catch(e) {}
    }
  }

  moveMouse(e: any | undefined) {
    var y;
    if (!e) {
      e = window;
      y = e.pageXOffset;
    }
    else {
      y = e.pageY;
    }

    y -= this.canvas.offsetTop;
    if (y - this.game.playerHeight / 2 >= 0 && y + this.game.playerHeight / 2 <= this.canvas.height)
      this.game.player.y = y;
  }

  update() {
    var dateTime = new Date();

    var gameTime = (dateTime.getTime() - this.gameTimeLast.getTime());
    if (gameTime < 0)
      gameTime = 0;

    var moveAmount = gameTime > 0 ? gameTime / 10 : 1;

    if (!this.game.pause) {
      /* Move cpu player */
      if (this.game.computer.y + 20 < this.game.ball.y && this.game.computer.y + this.game.playerHeight / 2 <= this.canvas.height)
        this.game.computer.y += this.game.computer.speed * moveAmount;
      else if (this.game.computer.y - 20 > this.game.ball.y && this.game.computer.y - this.game.playerHeight / 2 >= 0)
        this.game.computer.y -= this.game.computer.speed * moveAmount;

      /* Change direction of ball when hitting a wall */
      if (this.game.ball.y + this.game.ball.radius > this.canvas.height
        || this.game.ball.y - this.game.ball.radius < 0) {
        this.playSound(this.soundWall);
        if (this.game.ball.y <= this.game.ball.radius)
          this.game.ball.y = this.game.ball.radius;
        else
          this.game.ball.y = this.canvas.height - this.game.ball.radius;

        this.game.ball.vy *= -1;
      }

      /* checking collision between ball and player */
      if (this.game.ball.x + this.game.ball.radius >= this.canvas.width - this.game.playerWidth) {
        if (this.game.ball.y + this.game.ball.radius >= this.game.player.y - this.game.playerHeight / 2
          && this.game.ball.y + this.game.ball.radius <= this.game.player.y + this.game.playerHeight / 2) {
          this.playSound(this.soundRight);

          if (this.game.ball.vx <= this.game.ball.maxspeed) {
            this.game.ball.vx += this.game.ball.multiplier;
          }

          this.changeBallDirection(this.game.player);
        } else {
          this.game.computer.score++;
          document.getElementById("computerScore").innerHTML = this.game.computer.score;
          this.game.ball.reset();
          this.game.ball.vx = -1;
        }
      }
      /* checking collision between ball and cpu */
      else if (this.game.ball.x - this.game.ball.radius <= this.game.playerWidth) {
        if (this.game.ball.y + this.game.ball.radius >= this.game.computer.y - this.game.playerHeight / 2
          && this.game.ball.y + this.game.ball.radius <= this.game.computer.y + this.game.playerHeight / 2) {
          this.playSound(this.soundLeft);

          if (this.game.ball.vx >= -this.game.ball.maxspeed) {
            this.game.ball.vx -= this.game.ball.multiplier;
          }

          this.changeBallDirection(this.game.computer);
        } else {
          this.game.player.score++;
          document.getElementById("playerScore").innerHTML = this.game.player.score;
          this.game.ball.reset();
          this.game.ball.vx = 1;
        }
      }
      this.game.ball.x += this.game.ball.vx * moveAmount;
      this.game.ball.y += this.game.ball.vy * moveAmount;
    }

    this.draw();

    setTimeout(this.update, 1000 / 30);

    this.gameTimeLast = dateTime;
  }
  
  draw() {
    if (!this.game.pause) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      this.ctx.fillStyle = "rgb(64,64,64)";
      var size = 3;
      for(var y=0;y<this.canvas.height;y+=size*3) {
        this.ctx.fillRect(this.canvas.width / 2 - size/2, y, size, size);
      }
  
      // left player
      this.ctx.fillStyle = "rgba(128,128,128,.8)";
      this.ctx.fillRect(0, this.game.computer.y - this.game.playerHeight / 2,
          this.game.playerWidth, this.game.playerHeight);
      // right player
      this.ctx.fillRect(this.canvas.width - this.game.playerWidth, this.game.player.y
          - this.game.playerHeight / 2, this.game.playerWidth, this.game.playerHeight);
  
      this.ctx.fillStyle = "rgba(192,192,192,8)";
      this.ctx.fillRect(this.game.ball.x - this.game.ball.radius, this.game.ball.y
          - this.game.ball.radius, this.game.ball.radius * 2, this.game.ball.radius * 2);
    }
  } 


}
