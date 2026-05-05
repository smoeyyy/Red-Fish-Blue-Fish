class GameScene extends Phaser.Scene{

    constructor() {
        super("gameScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("redFish", "fish_red_outline.png");
        this.load.image("blueFish", "fish_blue_outline.png");
        this.load.image("greenFish", "fish_green_outline.png");

        this.load.image("smallBubble", "bubble_a.png");
        this.load.image("fullBubble", "bubble_b.png");
        this.load.image("bigBubble", "bubble_c.png");

        this.load.image("water", "background_terrain.png");

        this.load.image("sand1", "terrain_sand_a.png");
        this.load.image("sand2", "terrain_sand_b.png");
        this.load.image("sand3", "terrain_sand_c.png");
        this.load.image("sand4", "terrain_sand_d.png");

        this.load.audio("enemyHit", "universfield-bubble-pop-06-351337.mp3");
        this.load.audio("playerHit", "universfield-bubble-pop-02-293341.mp3");
    }

    create() {
        this.isPaused = false;
        this.isGameWon = false;
        this.time.removeAllEvents();
        this.enemyShootEvent = null;

        document.getElementById('description').innerHTML = '<h2>Red Fish Blue Fish - Trinity Willis </h2>'

        //Background
        this.tileSize = 64;
        this.gridWidth = Math.ceil(game.config.width / this.tileSize);
        this.gridHeight = Math.ceil(game.config.height / this.tileSize);
        this.bgTiles = ["water"];                                   // normal background
        this.floorTiles1 = ["sand1", "sand2", "sand3", "sand4"];    // bottom rows

        this.grid = [];

        for (let y = 0; y < this.gridHeight; y++) {
            let row = [];

            for (let x = 0; x < this.gridWidth; x++) {

                let texture;

                if (y === this.gridHeight - 1 || y === this.gridHeight - 2) {
                    texture = Phaser.Utils.Array.GetRandom(this.floorTiles1);
                }
                else {
                    texture = Phaser.Utils.Array.GetRandom(this.bgTiles);
                }

                let tile = this.add.sprite(x * this.tileSize, y * this.tileSize, texture).setOrigin(0);
                row.push(tile);
            }

            this.grid.push(row);
        }


        this.my = {
            sprite: {
                playerBullets: [],
                enemyBullets: [],
            }
        };

        this.enemies = [];

        this.waves = [
            { enemyCount: 5, enemySpeed: 100, spawnDelay: 1200 },
            { enemyCount: 10, enemySpeed: 150, spawnDelay: 900 },
            { enemyCount: 15, enemySpeed: 200, spawnDelay: 600 },
            { enemyCount: 1, enemySpeed: 85, spawnDelay: 0, boss: true }
        ];

        this.my.sprite.player = this.add.sprite(game.config.width/12, game.config.height/2, "redFish");

        this.enemyHitSound = this.sound.add("enemyHit");
        this.playerHitSound = this.sound.add("playerHit");

        this.playerHealth = 3;

        this.currentWaveIndex = 0;
        this.waveActive = false;
        this.waveConfig = null;
        this.maxBullets = 5
        this.bulletCount = this.maxBullets;
        this.waveSpawningDone = false;
        this.isGameOver = false;
        this.myScore = 0;
        this.isInvincible = false;

        this.playerSpeed = 300;
        this.bulletSpeed = 300;
        this.enemyBulletSpeed = 250;

        //Random event shooting
        this.enemyShootEvent = this.time.addEvent({
            delay: 1400,
            loop: true,
            callback: () => {

                if (this.enemies.length === 0 || this.isGameOver || this.isGameWon) return;

                // pick a random enemy
                let shooter = Phaser.Utils.Array.GetRandom(this.enemies);

                if (!shooter || !shooter.active) return;

                this.my.sprite.enemyBullets.push(
                    this.add.sprite(
                        shooter.x - shooter.displayWidth / 2,
                        shooter.y,
                        "smallBubble"
                    )
                );
            }
        });

        //Inputs
        this.up = this.input.keyboard.addKey("W");
        this.down = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.my.text = { text: {} };

        //On Screen Text
        this.my.text.score = this.add.text(game.config.width/6, game.config.height/10, "Score: " + this.myScore, {fontSize: "32px"}).setOrigin(0.5);
        this.my.text.bulletCounts = this.add.text(game.config.width/2, game.config.height/10, "Bubbles: " + this.bulletCount, {fontSize: "32px"}).setOrigin(0.5);
        this.my.text.waveCounts = this.add.text(game.config.width/6*5, game.config.height/10, "Wave: " + (this.currentWaveIndex+1), {fontSize: "32px"}).setOrigin(0.5);
        this.my.text.health = this.add.text(game.config.width/6, game.config.height/10*8, "Health: " + this.playerHealth, {fontSize: "32px"}).setOrigin(0.5);

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
        if (this.isGameOver || this.isGameWon) {
            if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
                this.scene.restart();
            }
            return;
        }

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

        // Start wave
        if (!this.waveActive && this.enemies.length === 0 && this.currentWaveIndex < this.waves.length) {
            this.startWave();
        }

        // Player Bullet Movement
        for (let bullet of my.sprite.playerBullets) {
            bullet.x += this.bulletSpeed * dt;
        }

        // Enemy Movement
        for (let enemy of this.enemies) {
            //Normal Enemies
            if (enemy !== this.boss) {
                enemy.x -= enemy.speed * dt;
                continue;
            }

            //Boss Movement
            enemy.timeOffset += dt;

            enemy.x -= enemy.speed * dt;

            enemy.y = enemy.startY + Math.sin(enemy.timeOffset * enemy.zigzagSpeed) * enemy.zigzagAmplitude;

            if (enemy.x < this.my.sprite.player.x - enemy.displayWidth) {
                this.triggerGameOver();
                return;
            }
        }

        // Enemy Bullet Movement
        for (let bullet of this.my.sprite.enemyBullets) {
            bullet.x -= this.enemyBulletSpeed * dt;
        }

        // collision with player
        for (let enemy of this.enemies) {

            //boss collision
            if (enemy === this.boss) {
                if (this.collides(enemy, this.my.sprite.player) || enemy.x < this.my.sprite.player.x - enemy.displayWidth) {
                    this.triggerGameOver();
                    return;
                }
                continue;
            }

            if (this.collides(enemy, this.my.sprite.player)) {
                enemy.destroy();
                this.takeDamage();
                continue;
            }
             if (enemy.x < this.my.sprite.player.x) {
                enemy.destroy();
                this.takeDamage();
                continue;
            }
        }

        //Collision detection for player bulets
        my.sprite.playerBullets = my.sprite.playerBullets.filter((bullet) => {
            let alive = true;

            for (let enemy of this.enemies) {
                if (enemy.active && this.collides(enemy, bullet)) {

                    enemy.health = (enemy.health || 1) - 1;
                    this.playerHitSound.play();
                    bullet.destroy();

                    if (enemy.health <= 0) {
                        enemy.destroy();
                        this.myScore += enemy.scorePoints;
                        this.updateScore();
                    }

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

        // Collision detection for enemy bullets
        this.my.sprite.enemyBullets = this.my.sprite.enemyBullets.filter((bullet) => {
            let alive = true;

            if (this.collides(bullet, this.my.sprite.player)) {
                this.enemyHitSound.play();
                bullet.destroy();
                this.takeDamage();
                alive = false;
            }

            if (bullet.x < -bullet.displayWidth) {
                bullet.destroy();
                alive = false;
            }

            return alive;
        });

        // Update Bullet Count
        this.bulletCount = this.maxBullets - this.my.sprite.playerBullets.filter(b => b.active).length;
        this.updateBulletCount();

        // Wave Completion
        if (this.waveActive && this.waveSpawningDone && this.enemies.length === 0) {
            this.waveActive = false;
            this.currentWaveIndex++;

            if (this.currentWaveIndex >= this.waves.length) {
                this.triggerWin();
                return;
            }

            this.startWave();
        }
    }

    collides(a, b) {
        if (!a || !b) return false;

        let ar = a.displayWidth * 0.3;
        let br = b.displayWidth * 0.3;

        let dx = a.x - b.x;
        let dy = a.y - b.y;

        let dist = Math.sqrt(dx * dx + dy * dy);

        return dist < (ar + br);
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score: " + this.myScore);
    }

    updateBulletCount() {
        let my = this.my;
        my.text.bulletCounts.setText("Bubbles: " + this.bulletCount);
    }

    takeDamage() {

        if (this.isInvincible) return;

        this.playerHealth -= 1;
        this.my.text.health.setText("Health: " + this.playerHealth);

        if (this.playerHealth <= 0) {
            this.triggerGameOver();
            return;
        }

        this.isInvincible = true;

        this.time.delayedCall(800, () => {
            this.isInvincible = false;
        });
    }

    triggerWin() {
        this.isGameWon = true;

        this.waveActive = false;

        for (let enemy of this.enemies) {
            enemy.setActive(false);
            enemy.destroy();
        }

        this.enemies = [];

        this.enemyShootEvent.remove();
        this.time.removeAllEvents();

        this.my.text.winScreen = this.add.text(
            game.config.width / 2,
            game.config.height / 2,
            "YOU WIN!\nPress R to Restart",
            {
                fontSize: "48px",
                align: "center"
            }
        ).setOrigin(0.5);
    }

    triggerGameOver() {
        this.isGameOver = true;

        this.waveActive = false;

        for (let enemy of this.enemies) {
            enemy.setActive(false);
            enemy.destroy();
        }
        this.enemies = [];
        this.enemyShootEvent.remove();
        this.time.removeAllEvents();

        this.my.text.gameOver = this.add.text(game.config.width / 2, game.config.height / 2, "GAME OVER\nPress R to Restart", {fontSize: "48px", align: "center"}).setOrigin(0.5);
    }

    startWave() {
        this.my.text.waveCounts.setText("Wave: " + (this.currentWaveIndex+1));

        this.waveActive = true;
        this.waveConfig = this.waves[this.currentWaveIndex];
        this.waveSpawningDone = false;

        this.enemies = [];
        this.boss = null;

        // FINAL WAVE: FORMATION + BOSS
        if (this.waveConfig.boss) {

            const positions = [
                [game.config.width/10*9, game.config.height/2 - 300],
                [game.config.width/10*9, game.config.height/2 + 300],
                [game.config.width/10*9 - 200, game.config.height/2 - 200],
                [game.config.width/10*9 - 200, game.config.height/2 + 200],
                [game.config.width/10*9 - 300, game.config.height/2]
            ];

            // formation enemies
            for (let pos of positions) {
                let e = this.add.sprite(pos[0], pos[1], "greenFish");
                e.setFlipX(true);
                e.health = 1;
                e.scorePoints = 25;
                e.speed = this.waveConfig.enemySpeed
                this.enemies.push(e);
            }

            // boss
            this.boss = this.add.sprite(
                game.config.width/10 * 9,
                game.config.height/2,
                "greenFish"
            );

            this.boss.setScale(3);
            this.boss.setFlipX(true);
            this.boss.health = 10;
            this.boss.scorePoints = 500;
            this.boss.speed = this.waveConfig.enemySpeed;
            this.boss.startY = game.config.height / 2;
            this.boss.timeOffset = 0;
            this.boss.zigzagAmplitude = 120;
            this.boss.zigzagSpeed = 2;

            this.enemies.push(this.boss);

            this.waveSpawningDone = true;

            return;
        }

        // NORMAL WAVES (1–3)
        let spawned = 0;

        this.time.addEvent({
            delay: this.waveConfig.spawnDelay,
            repeat: this.waveConfig.enemyCount - 1,
            callback: () => {

                let enemy = this.add.sprite(game.config.width/10*9, Phaser.Math.Between(50, 550),"blueFish"
                );

                enemy.setFlipX(true);
                enemy.speed = this.waveConfig.enemySpeed;
                enemy.scorePoints = 25;
                enemy.health = 1;

                this.enemies.push(enemy);

                spawned++;
                if (spawned === this.waveConfig.enemyCount) {
                    this.waveSpawningDone = true;
                }
            }
        });
    }

}