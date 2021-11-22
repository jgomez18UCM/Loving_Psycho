export default class Background extends Phaser.Image{
    constructor(scene, x, y){
        super(scene, x, y, 'blackBackground');
        this.setScale(this.height,this.height);
        this.scene.events.on('changeBackground', this.changeBackground, this);
        this.scene.add.existing(this);
    }
        
    changeBackground(background){
        this.setImage(background);
    }
}