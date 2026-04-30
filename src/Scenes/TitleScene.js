class TitleScene extends Phaser.Scene{

    constructor() {
        super("titleScene");
    }

    preload() {

    }

    create() {
        document.getElementById('description').innerHTML = '<h2>Red Fish Blue Fish - Trinity Willis </h2>'

        this.add.text(600, 300, "CLICK TO START", {
            fontSize: "32px",
        }).setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("gameScene");
        });
    }

    update(){

    }

}