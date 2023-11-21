import * as Phaser from "phaser";
import { GameWorld } from "../classes/gameWorld.ts";
import { plantTypeToEmoji, PlantType } from "../classes/plant.ts";
import { Player } from "../classes/player.ts";
import { Point } from "../classes/gameWorld.ts";

export default class Play extends Phaser.Scene {
  // fire?: Phaser.Input.Keyboard.Key;
  // left?: Phaser.Input.Keyboard.Key;
  // right?: Phaser.Input.Keyboard.Key;
  // starfield?: Phaser.GameObjects.TileSprite;
  // spinner?: Phaser.GameObjects.Shape;
  // rotationSpeed = Phaser.Math.PI2 / 1000;
  private buttonSize = 35;
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
    // // Set up event listeners
    // this.button.on("pointerdown", this.onButtonClicked, this);

    //this.board.placePlant({ x: 1, y: 1 }, "Sunflower");
    //this.board.placePlant({ x: 2, y: 1 }, "AppleTree");
    //this.board.placePlant({ x: 1, y: 2 }, "Sunflower");
    this.redraw();
    //this.player = board.createPlayer({ x: 1, y: 6 });

  
    this.addDirectionButton("➡️",100 + 2 * this.buttonSize, 400 , 1 , 0); // Right
    this.addDirectionButton( "⬅️",100 - 2 * this.buttonSize, 400, -1, 0); // left
    this.addDirectionButton("⬆️",100, 400 - 2 * this.buttonSize, 0, -1); // up
    this.addDirectionButton("⬇️",100, 400, 0, 1); // down
  
    const intialButton = { x: 300, y: 400 };
    let i = 0;

    plantTypeToEmoji.forEach((_value, key) => {
      this.addPlantButton(key, { x: intialButton.x + i * this.buttonSize, y: 400 });
      i++;
    });

    this.add.text(500, 400, "🚜")
    .setInteractive()
    .setFontSize("30pt")
      .on("pointerdown", () => {
        this.board.harvestPlant(this.player.point)
      this.onButtonClicked();
    })
  }

  
  addDirectionButton(emoji: string, posX : number, posY: number, dirX: number, dirY: number) {
    this.add.text(posX, posY, emoji)
    .setFontSize("30pt")
    .setInteractive()
    .setPadding(3,7)
    .on("pointerdown", () => {
      this.player.move(dirX, dirY);
      this.onButtonClicked();
    })
  }

  addPlantButton(plantName: PlantType, point:Point) {
    // const pt = plantName as string;
    this.add.text(point.x, point.y, plantTypeToEmoji.get(plantName)!)
    .setInteractive().setFontSize('20pt')
      .on("pointerdown", () => {
      this.board.placePlant(this.player.point, plantName);
      this.onButtonClicked();
    })
  }
  
  onButtonClicked() {
    // Handle button click
    console.log("click");
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
