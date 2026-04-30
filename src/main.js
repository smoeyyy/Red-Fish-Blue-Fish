// Trinity Willis
// Red Fish Blue Fish
// Gallery Shooter Style Game

let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 1200,
    height: 800,
    scene: [TitleScene, GameScene, PauseScene]
}

const game = new Phaser.Game(config);