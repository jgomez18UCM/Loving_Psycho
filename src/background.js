/**
 * Representa el fondo de la cita.
 */
export default class Background extends Phaser.GameObjects.Image {
    /**
     * Construye un nuevo objeto Background
     * @param {Phaser.Scene} scene 
     * @param {number} x - posición en el eje x
     * @param {number} y - posición en el eje y
     * @param {string} texture - nombre de la textura a dar al objeto
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.scene.add.existing(this);
        this.scene.events.on('changeLocation', this.changeBackground, this);
        this.on('destroy', () => this.scene.events.off('changeLocation'));
    }

    /**
     * Este método sirve para cambiar la imagen del Background.
     * @param {string} background - El nuevo fondo al que hay que cambiar. 
     */
    changeBackground(background) {
        this.setTexture(background);
    }
}