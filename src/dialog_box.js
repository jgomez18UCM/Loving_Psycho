import DialogManager from "./dialog_manager.js";

/**
 * Representa un cuadro de diálogo.
 */
export default class DialogBox extends Phaser.GameObjects.Container {
  /**
   * 
   * @param {Phaser.Scene} scene - Escena a la que pertenece la dialogBox. 
   * @param {number} x - Posicion en x. 
   * @param {number} y - Posicion en y.
   * @param {number} width - Ancho.
   * @param {number} height - Alto.
   * @param {boolean} inter -  True si el cuadro de dialogo es interactivo, False si no lo es.
   * @param {DialogManager} dialogManager - DialogManager de la escena.
   */
  constructor(scene, x, y, width, height, inter, dialogManager) {
    super(scene, x, y);
    this._dialogManager = dialogManager;
    this.scene.events.on('optionsStart', this.showOptionDialog, this);
    this.scene.events.on('changeDialogBox', this.changeDialogeBox, this);
    this.initContainer(inter, width, height);


    //Variables para gestionar la escritura del diálogo
    this.initProperties();

    this.on("destroy", () => { //esto si
      this.scene.events.off('optionsStart');
      this.scene.events.off('changeDialogBox');
    });
  }

  /**
   * Crea el sprite del cuadro de dialogo
   * @param {number} w - ancho
   * @param {number} h - alto
   * @returns {Phaser.GameObjects.Sprite} - El sprite del cuadro de dialogo.
   */
  createDialogBox(w, h) {
    let dialogBackground = new Phaser.GameObjects.Sprite(this.scene, 0, -50, this._dialogManager.getActualNode().speaker);
    dialogBackground.setScale(w, h);
    dialogBackground.setOrigin(0.5, 0.5);
    return dialogBackground;
  }

  /**
   * Crea el texto del cuadro de dialogo
   * @returns {Phaser.GameObjects.Text} - El texto del cuadro de dialogo
   */
  createText(inter) {
    let SPACING = 45;
    if (!inter) SPACING = 27;
    if (this.inter) SPACING = 20;
    let x = this._dialogBackground.x - this._sizeW / 2 + SPACING;
    let y = this._dialogBackground.y - this._sizeH / 2 + SPACING / 2;
    let text = new Phaser.GameObjects.Text(this.scene, x, y, '');
    text.setWordWrapWidth(this._sizeW - SPACING * 2);
    text.setFontStyle('bold');
    text.setFontSize(28);
    text.setColor('#000');
    return text;
  }

  /**
   * Añade los componentes al container y coloca el container en su posicion
   */
  createContainer() {
    this.add(this._dialogBackground);
    this.add(this._text);
    if (this._interactive)
      this.setPosition(this.x, this.y - this._sizeH / 2);
    else {
      let offsetY = 100;
      this.setPosition(this.x, this.y + offsetY);
      this.setVisible(false);
      this.setActive(false);
    }

  }

  /**
   * Añade el container a la escena y decide si es interactivo o no.
   * @param {boolean} inter - true si el cuadro de dialogo es interactivo, false si no lo es.
   * @param {number} w - ancho del sprite.
   * @param {number} h - alto del sprite.
   */
  initContainer(inter, w, h) {

    this._interactive = inter;
    //Creación del cuadro de diálogo
    this._dialogBackground = this.createDialogBox(w, h);

    //Cálculo del size.
    this._sizeH = (h * this._dialogBackground.height);
    this._sizeW = (w * this._dialogBackground.width);

    //Creación del texto
    this._text = this.createText(inter);

    //Creación del container
    this.createContainer();

    //Convierto el cuadro en un botón para gestionar el texto
    if (this._interactive) {
      this._dialogBackground.setInteractive();
      this._dialogBackground.on('pointerdown', this.writeText, this);
    }

    //Añado el container a la escena
    this.scene.add.existing(this);
  }

  /**
   * Inicializa las propiedades necesarias para la escritura progresiva del texto.
   */
  initProperties() {
    this._paragraph = this._dialogManager.getActualNode().dialogs;
    this._actParrafo = '';
    this._cont = 0;
    this._delay = 0;
    this._textoEscrito = false;
    this._textSpeed = this.scene.textVelocity;
  }

  /**
   * Escribe el diálogo que hay en el nodo actual de _dialogManager en el texto. 
   */
  writeText() {
    if (!this._textoEscrito) {
      this._text.setText(this._paragraph);
      this._textoEscrito = true;
      this.scene.events.emit('writtenText');
    } else {
      this.reset();
      this.scene.events.emit('dialogBoxClicked', this._dialogManager.getActualNode().id_obj);
      if (this._dialogManager.isOption()) {
        this.scene.events.emit('optionsStart', this._dialogManager.getActualNode());
      } else {
        this._paragraph = this._dialogManager.getActualNode().dialogs;
      }
    }
  }

  /**
   * Oculta el cuadro de dialogo si es interactivo, en caso contrario lo resetea y escribe en su diálogo el diálogo del nodo actual.
   * @param {Node} nextDialog - 
   */
  showOptionDialog(nextDialog) {
    if (this._interactive) {
      this.setVisible(false);
      this.setActive(false);
    } else {
      this.reset();
      this._paragraph = nextDialog.dialogs;
      this.setVisible(true);
      this.setActive(true);
    }
  }

  /**
   * Resetea las variables de estado del cuadro de diálogo y cambia su texto al del nodo actual del dialog manager.
   */

  reset() {
    this._actParrafo = '';
    this._cont = 0;
    this._delay = 0;
    this._textoEscrito = false;
    this._paragraph = this._dialogManager.getActualNode().dialogs;
  }

  /**
   * Cambia el sprite del cuadro de diálogo.
   * @param {string} speaker - key del nuevo sprite del cuadro de diálogo.
   */
  changeDialogeBox(speaker) {
    this._dialogBackground.setTexture(speaker);
  }

  /**
   * Cambia la velocidad del texto.
   * @param {number} velocity - nueva velocidad del texto
   */
  setTextVelocity(velocity) {
    this._textSpeed = velocity;
  }

  /**
   * Escribe el texto guardado en this._paragraph progresivamente
   * @override
   */
  preUpdate(t, dt) {

    if (!this._textoEscrito) {
      if (this._delay <= 0) {
        if (this._cont < this._paragraph.length) {
          this._actParrafo += this._paragraph[this._cont];
          this._text.setText(this._actParrafo);
          this._cont++;
          this._delay = 100 - this._textSpeed;
        } else {
          this._textoEscrito = true;
        }
      } else this._delay -= dt;
    }
  }

}