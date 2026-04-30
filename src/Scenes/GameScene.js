class GameScene extends Phaser.Scene{

    constructor() {
        super("gameScene");
        this.my = { sprite: {} };

        this.playerX = 0;
        this.playerY = 0;

        this.isPaused = false;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("redFish", "fish_red_outline.png");
        this.load.image("blueFish", "fish_blue_outline.png");
        this.load.image("greenFish", "fish_green_outline.png");
    }

    create() {
        document.getElementById('description').innerHTML = '<h2>Red Fish Blue Fish - Trinity Willis </h2>'

        this.add.text(600, 300, "Game Running", {
            fontSize: "32px",
        }).setOrigin(0.5);

        this.escapeKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );

        this.escapeKey.on("down", () => {
            this.isPaused = true; 
            this.scene.pause();
            this.scene.launch("pauseScene");
        });
  }

    update(){
        if (this.isPaused) return;
    }

}