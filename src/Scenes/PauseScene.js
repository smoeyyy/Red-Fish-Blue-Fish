class PauseScene extends Phaser.Scene{

    constructor() {
        super("pauseScene");
    }

    preload() {

    }

    create() {
        document.getElementById('description').innerHTML = '<h2>Red Fish Blue Fish - Trinity Willis </h2>'

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5);

        this.add.text(600, 300, "Paused\nPress ESC to resume", {
            fontSize: "32px",
        }).setOrigin(0.5);

        this.escapeKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );

        this.escapeKey.on("down", () => {
            this.scene.stop();
            this.scene.resume("gameScene");
        });
    }

    update(){

    }

}