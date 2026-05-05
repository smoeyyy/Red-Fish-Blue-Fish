class GameScene extends Phaser.Scene{

    constructor() {
        super("gameScene");

        this.myScore = 0;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("redFish", "fish_red_outline.png");
        this.load.image("blueFish", "fish_blue_outline.png");
        this.load.image("greenFish", "fish_green_outline.png");

        this.load.image("smallBubble", "bubble_a.png");
        this.load.image("fullBubble", "bubble_b.png");
        this.load.image("bigBubble", "bubble_c.png");
    }

    create() {
        this.isPaused = false;

        document.getElementById('description').innerHTML = '<h2>Red Fish Blue Fish - Trinity Willis </h2>'

        this.my = {
            sprite: {
                playerBullets: [],
                enemyBullets: [],
            }
        };

        this.enemies = [];

        this.waves = [
            {
                enemyCount: 5,
                enemySpeed: 100,
                spawnDelay: 1200,
                boss: false
            },
            {
                enemyCount: 10,
                enemySpeed: 150,
                spawnDelay: 900,
                boss: false
            },
            {
                enemyCount: 15,
                enemySpeed: 200,
                spawnDelay: 600,
                boss: true
            }
        ];

        this.my.sprite.player = this.add.sprite(game.config.width/12, game.config.height/2, "redFish");

        this.currentWaveIndex = 0;
        this.waveActive = false;
        this.waveConfig = null;
        this.maxBullets = 5
        this.bulletCount = this.maxBullets;
        this.bossSpawned = false;
        this.boss = null;
        this.waveCleared = false;

        this.playerSpeed = 300;
        this.bulletSpeed = 300;
        this.enemySpeed = 200;

        //Inputs
        this.up = this.input.keyboard.addKey("W");
        this.down = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.my.text = { text: {} };

        //On Screen Text
        this.my.text.score = this.add.text(game.config.width/4, game.config.height/10, "Score: " + this.myScore, {fontSize: "32px"}).setOrigin(0.5);
        this.my.text.bulletCounts = this.add.text(game.config.width/2, game.config.height/10, "Bubbles: " + this.bulletCount, {fontSize: "32px"}).setOrigin(0.5);

        //Pause Scene Implementation
        this.escapeKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );

        this.escapeKey.on("down", () => {
            this.isPaused = true; 
            this.scene.pause();
            this.scene.launch("pauseScene");
        });
  }

    update(time, delta){
        if (this.isPaused) return;

        let my = this.my;
        let dt = delta / 1000;

        // Moving up
        if (this.up.isDown) {
            if (my.sprite.player.y > (my.sprite.player.displayHeight/2)) {
                my.sprite.player.y -= this.playerSpeed * dt;
            }
        }

        // Moving down
        if (this.down.isDown) {
            if (my.sprite.player.y < (game.config.height - (my.sprite.player.displayHeight/2))) {
                my.sprite.player.y += this.playerSpeed * dt;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            if (my.sprite.playerBullets.length < this.maxBullets) {
                my.sprite.playerBullets.push(this.add.sprite(
                    my.sprite.player.x + (my.sprite.player.displayWidth/2), my.sprite.player.y, "fullBubble")
                );
            }
        }

        this.enemies = this.enemies.filter(enemy => enemy.active);
        
        //Spawn Boss?
        if (this.waveCleared && this.waveHasBoss && !this.bossSpawned) {
            this.bossSpawned = true;
            this.spawnBoss();
        }

        // Start wave
        if (this.waveCleared && !this.waveHasBoss && !this.waveActive) {
            this.waveCleared = false;
            this.startWave();
        }

        //Bullet Movement
        for (let bullet of my.sprite.playerBullets) {
            bullet.x += this.bulletSpeed * dt;
        }

        // Enemy Movement
        for (let enemy of this.enemies) {
            enemy.x -= enemy.speed * dt;
        }

        //Collision detection
        my.sprite.playerBullets = my.sprite.playerBullets.filter((bullet) => {

            let alive = true;

            for (let enemy of this.enemies) {
                if (enemy.active && this.collides(enemy, bullet)) {

                    bullet.destroy();
                    enemy.destroy();

                    this.myScore += enemy.scorePoints;
                    this.updateScore();

                    alive = false;
                    break;
                }
            }

            if (bullet.x > this.game.config.width + bullet.displayWidth) {
                bullet.destroy();
                alive = false;
            }

            return alive;
        });

        // Boss logic
        my.sprite.playerBullets = my.sprite.playerBullets.filter((bullet) => {

            if (this.boss && this.boss.active && this.collides(this.boss, bullet)) {

                this.boss.health--;
                bullet.destroy();

                if (this.boss.health <= 0) {

                    this.myScore += this.boss.scorePoints;
                    this.updateScore();

                    this.boss.destroy();
                    this.boss = null;

                    this.currentWaveIndex++;
                    this.waveActive = false;
                    this.bossSpawned = false;
                    this.waveCleared = true;
                    this.waveHasBoss = false;
                }

                return false;
            }

            return true;
        });

        // Update Bullet Count
        this.bulletCount = this.maxBullets - this.my.sprite.playerBullets.filter(b => b.active).length;
        this.updateBulletCount();

        if (this.waveActive && this.enemies.length === 0 && !this.waveHasBoss) {
            this.waveActive = false;
            this.waveCleared = true;
            this.currentWaveIndex++;
        }
    }

    collides(a, b) {
        if (!a || !b) return false;
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score: " + this.myScore);
    }

    updateBulletCount() {
        let my = this.my;
        my.text.bulletCounts.setText("Bubbles: " + this.bulletCount);
    }

    startWave() {

        this.waveConfig = this.waves[this.currentWaveIndex];
        this.waveActive = true;

        this.enemiesRemainingToSpawn = this.waveConfig.enemyCount;

        this.time.addEvent({
            delay: this.waveConfig.spawnDelay,
            repeat: this.waveConfig.enemyCount - 1,
            callback: () => {

                let enemy = this.add.sprite(
                    800,
                    Phaser.Math.Between(50, 550),
                    "blueFish"
                );

                enemy.setFlipX(true);
                enemy.speed = this.waveConfig.enemySpeed;
                enemy.scorePoints = 25;

                this.enemies.push(enemy);
            }
        });

        this.waveHasBoss = this.waveConfig.boss;
    }

    spawnBoss() {

        let sizeMultiplier = 1 + this.currentWaveIndex * 0.5;

        this.boss = this.add.sprite(800, 300, "greenFish");
        this.boss.setScale(3 * sizeMultiplier);

        this.boss.health = 10 + this.currentWaveIndex * 5;
        this.boss.scorePoints = 100 * (this.currentWaveIndex + 1);
    }

}