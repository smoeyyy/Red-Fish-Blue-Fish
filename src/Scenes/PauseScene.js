class PauseScene extends Phaser.Scene{

    constructor() {
        super("pauseScene");
    }

    preload() {

    }

    create() {
        document.getElementById('description').innerHTML = '<h2>Red Fish Blue Fish - Trinity Willis </h2>'

        this.add.rectangle(400, 300, 1200, 800, 0x000000, 0.5);

        this.add.text(game.config.width/2, game.config.height/5, "Paused", {
            fontSize: "32px",
        }).setOrigin(0.5);

        this.add.text(game.config.width/2, game.config.height/2, "W and S keys to move up and down\nSPACE to shoot\nESC to Pause/Resume", {
            fontSize: "32px",
        }).setOrigin(0.5);

        this.escapeKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );

        this.escapeKey.on("down", () => {
            this.scene.stop();
            this.scene.resume("gameScene");
            let gameScene = this.scene.get("gameScene");
            gameScene.isPaused = false;
        });
    }

    update(){

    }

}