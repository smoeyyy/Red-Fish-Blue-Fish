class TitleScene extends Phaser.Scene{

    constructor() {
        super("titleScene");
    }

    preload() {

    }

    create() {
        document.getElementById('description').innerHTML = '<h2>Red Fish Blue Fish - Trinity Willis </h2>'

        this.add.text(game.config.width/2, game.config.height/2, "Red Fish Blue Fish\n\nCLICK TO START\n\nESC for Controls", {
            fontSize: "32px",
        }).setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("gameScene");
        });
    }

    update(){

    }

}