import * as Phaser from "phaser";
import { GameWorld } from "../classes/gameWorld.ts";
//import { Plant, plantTypeToEmoji, PlantType } from "../classes/plant.ts";
import { Player } from "../classes/player.ts";

export default class Play extends Phaser.Scene {
  // fire?: Phaser.Input.Keyboard.Key;
  // left?: Phaser.Input.Keyboard.Key;
  // right?: Phaser.Input.Keyboard.Key;
  // starfield?: Phaser.GameObjects.TileSprite;
  // spinner?: Phaser.GameObjects.Shape;
  // rotationSpeed = Phaser.Math.PI2 / 1000;
  private button: Phaser.GameObjects.Rectangle | null = null;

  board: GameWorld = new GameWorld();
  player: Player = this.board.createPlayer({ x: 0, y: 0 });
  drawnElements: Phaser.GameObjects.Text[] = [];

  constructor() {
    super("play");
  }

  preload() {
    //this.load.image("starfield", starfieldUrl);
  }

  // #addKey(
  //   name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  // ): Phaser.Input.Keyboard.Key {
  //   return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  // }

  create() {
    this.button = this.add
      .rectangle(400, 300, 200, 100, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    // Set up event listeners
    this.button.on("pointerdown", this.onButtonClicked, this);

    this.board.placePlant({ x: 1, y: 1 }, "Sunflower");
    this.board.placePlant({ x: 2, y: 1 }, "AppleTree");
    this.board.placePlant({ x: 1, y: 2 }, "Sunflower");
    this.redraw();
    //this.player = board.createPlayer({ x: 1, y: 6 });

    // this.fire = this.#addKey("F");
    // this.left = this.#addKey("LEFT");
    // this.right = this.#addKey("RIGHT");=
    // this.starfield = this.add
    //   .tileSprite(
    //     0,
    //     0,
    //     this.game.config.width as number,
    //     this.game.config.height as number,
    //     "starfield",
    //   )
    //   .setOrigin(0, 0);
    // this.spinner = this.add.rectangle(100, 100, 50, 50, 0xff0000);
    this.button = this.add
      .rectangle(50, 250, 35, 35, 0x000000)
      .setInteractive()
      .on("pointerdown", () => {
        this.onButtonClicked();
      });
  }
  onButtonClicked() {
    // Handle button click
    console.log("click");
    this.player.move(0, 1);
    this.redraw();
  }

  redraw() {
    this.deleteDrawings();
    this.drawnElements = this.board.drawTo(this);
  }

  deleteDrawings() {
    this.drawnElements.forEach((t) => {
      t.destroy();
    });
  }
  //Called every tick
  //Maybe redraw the screen only when there is a screen change
  update() {}
}
