import * as Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    // Don't show any game menu here.
    // Just immediately transition to the play scene.
    this.scene.start("play");
  }
}
