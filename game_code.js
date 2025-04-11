class RocketGame extends Phaser.Scene {
    constructor() {
        super({ key: 'RocketGame' });
    }

    preload() {
        this.load.image('rocket', 'assets/rocket.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('rock', 'assets/rock.png');
    }

    create() {
        this.survivalTime = 60;
        this.rockSpeed = 200;
        this.gameIsOver = false;

        this.targetScore = Phaser.Math.Between(500, 800);

        this.rocket = this.physics.add.image(400, 550, 'rocket').setCollideWorldBounds(true);

        this.bullets = this.physics.add.group();
        this.lastFired = 0;

        this.rocks = this.physics.add.group();
        this.spawnRock();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });
        this.timerText = this.add.text(16, 50, 'Time: 60', { fontSize: '24px', fill: '#fff' });
        this.targetScoreText = this.add.text(600, 16, 'Target: ' + this.targetScore, { fontSize: '24px', fill: '#fff' });

        this.physics.add.overlap(this.bullets, this.rocks, this.destroyRock, null, this);
        this.physics.add.overlap(this.rocket, this.rocks, this.gameOver, null, this);

        // Mobile controls
        if (!this.sys.game.device.os.desktop) {
            this.leftButton = this.add.rectangle(60, 540, 100, 100, 0x6666ff).setInteractive();
            this.rightButton = this.add.rectangle(180, 540, 100, 100, 0x6666ff).setInteractive();
            this.fireButton = this.add.rectangle(740, 540, 100, 100, 0xff6666).setInteractive();

            this.leftButtonText = this.add.text(30, 520, 'Left', { fontSize: '20px', fill: '#fff' });
            this.rightButtonText = this.add.text(150, 520, 'Right', { fontSize: '20px', fill: '#fff' });
            this.fireButtonText = this.add.text(700, 520, 'Shoot', { fontSize: '20px', fill: '#fff' });

            this.isMovingLeft = false;
            this.isMovingRight = false;
            this.isFiring = false;

            this.leftButton.on('pointerdown', () => this.isMovingLeft = true);
            this.leftButton.on('pointerup', () => this.isMovingLeft = false);
            this.leftButton.on('pointerout', () => this.isMovingLeft = false);

            this.rightButton.on('pointerdown', () => this.isMovingRight = true);
            this.rightButton.on('pointerup', () => this.isMovingRight = false);
            this.rightButton.on('pointerout', () => this.isMovingRight = false);

            this.fireButton.on('pointerdown', () => this.isFiring = true);
            this.fireButton.on('pointerup', () => this.isFiring = false);
            this.fireButton.on('pointerout', () => this.isFiring = false);
        }

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.gameIsOver) return;

                this.survivalTime--;

                if (this.survivalTime % 10 === 0) {
                    this.rockSpeed = Math.min(this.rockSpeed + 50, 600);
                }

                this.timerText.setText('Time: ' + this.survivalTime);

                if (this.survivalTime <= 0 && this.score < this.targetScore) {
                    this.endGame('You Lose!');
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    update(time) {
        if (this.gameIsOver) return;

        let velocityX = 0;
        if (this.cursors.left.isDown || this.isMovingLeft) {
            velocityX = -300;
        } else if (this.cursors.right.isDown || this.isMovingRight) {
            velocityX = 300;
        }
        this.rocket.setVelocityX(velocityX);

        if ((this.spaceKey.isDown || this.isFiring) && time > this.lastFired) {
            const bullet = this.bullets.create(this.rocket.x, this.rocket.y - 20, 'bullet');
            bullet.setVelocityY(-400);
            this.lastFired = time + 300;
        }

        if (time % 1000 < 20) {
            this.spawnRock();
        }
    }

    spawnRock() {
        if (this.gameIsOver) return;
        const x = Phaser.Math.Between(50, 750);
        const rock = this.rocks.create(x, 0, 'rock');
        rock.setVelocityY(this.rockSpeed);
    }

    destroyRock(bullet, rock) {
        bullet.destroy();
        rock.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.score >= this.targetScore) {
            this.endGame('You Win!');
        }
    }

    gameOver(rocket, rock) {
        this.endGame('Game Over');
    }

    endGame(message) {
        this.gameIsOver = true;
        this.physics.pause();
        this.rocket.setTint(0xff0000);
        this.add.text(250, 300, message, { fontSize: '48px', fill: '#fff' });
        this.timerEvent.remove();

        const restartButton = this.add.text(330, 380, 'Restart', {
            fontSize: '32px',
            fill: '#0f0',
            backgroundColor: '#222',
            padding: { x: 20, y: 10 },
            borderRadius: 10
        }).setInteractive();

        restartButton.on('pointerdown', () => {
            restartButton.disableInteractive();
            this.scene.restart();
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: RocketGame
};

const game = new Phaser.Game(config);
