import Button from "./button.js";

export default class DifficultyButton extends Button {
    constructor(scene, x, y, text, difficulty){
        super(scene, x, y, 'boton');
        this.scene.events.on('difficultyButtonClicked', this.changeColor, this);

        this.setScale(0.8, 0.8);
        this.text = this.scene.add.text(x, y, text).setOrigin(0.5, 0.6).setFontSize(40);

        this.on("pointerdown", () =>{
            this.scene.setDifficulty(difficulty);
            this.scene.events.emit('difficultyButtonClicked', difficulty);
            this.scene.spawnHearts(x, y);
        });
        this.dif = difficulty;
    }

    changeColor(newDifficulty){
        if (this.dif === newDifficulty){
            this.text.setColor('#f00');
        }
        else{
            this.text.setColor('#000');
        }
            
    }
}