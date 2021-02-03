import { Component, HostListener, OnInit } from '@angular/core';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    if (this.game && !this.game.pause) {
      this.moveMouse(e);
    }
  }
  readonly uri: string = 'ws://localhost:4000';
  private canvas: any;
  private game: any;
  private ctx: any;
  private soundLeft: any;
  private soundRight: any;
  private soundWall: any;
  private gameTimeLast: Date;
  public playerNumber: Number;

  constructor(private webS: WebSocketService) { }

  ngOnInit(): void {

    this.gameTimeLast = new Date();
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.soundLeft = document.getElementById("bounceLeft");
    this.soundRight = document.getElementById("bounceRight");
    this.soundWall = document.getElementById("bounceWall");
    this.webS.listen('update').subscribe((data) => {
      if (this.game && !this.game.pause) {
        this.update(data);
      }
    });
    this.webS.listen('opponentUpdate').subscribe((data: any) => {
      if (this.game && !this.game.pause) {
        if (data.computer !== null && this.playerNumber === 1) {
          this.game.computer = data.computer;
        } else {
          this.game.player = data.player;
        }
      }
    });
    this.webS.listen('playerNumber').subscribe((data: Number) => {
      this.playerNumber = data;
    });
  }

  gameInit() {
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
        multiplier: .2,
        maxspeed: 5
      },
      playerHeight: 80,
      playerWidth: 4,
      pause: false,
      sound: false
    };
    this.webS.emit('start', { canvas: { height: this.canvas.height, width: this.canvas.width }, ball: this.game.ball, player: this.game.player, computer: this.game.computer });
  }


  playSound(snd: { paused: any; pause: () => void; currentTime: number; play: () => void; }) {
    if (this.game.sound) {
      try {
        if (!snd.paused) {
          // Pause and reset it
          snd.pause();
          snd.currentTime = 0;
        }
        snd.play();
      }
      catch (e) { }
    }
  }

  moveMouse(e: any | undefined) {
    if (this.playerNumber === 1) {
      var y;
      if (!e) {
        e = window;
        y = e.pageXOffset;
      }
      else {
        y = e.pageY;
      }

      y -= this.canvas.offsetTop;
      if (y - this.game.playerHeight / 2 >= 0 && y + this.game.playerHeight / 2 <= this.canvas.height && this.game.computer !== undefined)
        this.game.computer.y = y;
      this.webS.emit('mouseMove', this.game.computer);
    } else {
      var y;
      if (!e) {
        e = window;
        y = e.pageXOffset;
      }
      else {
        y = e.pageY;
      }

      y -= this.canvas.offsetTop;
      if (y - this.game.playerHeight / 2 >= 0 && y + this.game.playerHeight / 2 <= this.canvas.height && this.game.player !== undefined)
        this.game.player.y = y;
      this.webS.emit('mouseMove', this.game.player);
    }
  }

  update(incData) {
    this.game.ball = incData.ball;
    this.game.player = incData.player;
    this.game.computer = incData.computer;
    document.getElementById("playerScore").innerHTML = this.game.player.score;
    document.getElementById("computerScore").innerHTML = this.game.computer.score;
    this.draw();

  }

  draw() {
    if (!this.game.pause) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = "rgb(64,64,64)";
      var size = 3;
      for (var y = 0; y < this.canvas.height; y += size * 3) {
        this.ctx.fillRect(this.canvas.width / 2 - size / 2, y, size, size);
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

  pause() {
    if (!this.game.pause) {
      this.game.pause = true;
      document.getElementById('pauseButton').innerHTML = "Continue";
      document.getElementById('pauseText').style.display = "block";
    }
    else {
      this.game.pause = false;
      document.getElementById('pauseButton').innerHTML = "Pause";
      document.getElementById('pauseText').style.display = "none";
    }
  }

  toggleSound() {
    if (!this.game.sound) {
      this.game.sound = true;
      document.getElementById('soundButton').innerHTML = "Turn off sound";
    }
    else {
      this.game.sound = false;
      document.getElementById('soundButton').innerHTML = "Turn on sound";
    }
  }

  addItem() {
    var li = document.createElement("LI");
    li.innerHTML = "Tim";
    document.getElementById("faves").appendChild(li);
  }

  intro() {
    document.getElementById('titleScreen').style.display = "none";
    document.getElementById('playScreen').style.display = "block";
    this.gameInit();
  }


}
