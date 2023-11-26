import * as Phaser from "phaser";
import { GameWorld } from "../classes/gameWorld.ts";
import { plantTypeToEmoji, PlantType } from "../classes/plant.ts";
import { Player } from "../classes/player.ts";
import { Point } from "../classes/gameWorld.ts";

export default class Play extends Phaser.Scene {
  private buttonSize = 35;
  board: GameWorld = new GameWorld();
  player: Player = this.board.createPlayer({ x: 0, y: 0 });
  drawnElements: Phaser.GameObjects.Text[] = [];

  gameHistory: string[] = [];
  redoHistory: string[] = [];

  lastMove: string = this.board.exportTo();

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
    // this.gameHistory.push(this.board.exportTo());
    this.redraw();
    //this.player = board.createPlayer({ x: 1, y: 6 });
    this.add.rectangle(590, 0, 50, 700, 0x000000).setOrigin(0, 0);

    this.addDirectionButton("⬅️", -1, 0);
    this.addDirectionButton("➡️", 1, 0);
    this.addDirectionButton("⬆️", 0, -1);
    this.addDirectionButton("⬇️", 0, 1);

    const undoButton = document.querySelector(`#undoButton`);
    undoButton?.addEventListener("click", () => {
      this.undo();
    });

    const redoButton = document.querySelector(`#redoButton`);
    redoButton?.addEventListener("click", () => {
      this.redo();
    });

    const intialButton = { x: 300, y: 400 };
    let i = 0;

    for (const key in plantTypeToEmoji) {
      this.addPlantButton(key as PlantType, {
        x: intialButton.x + i * this.buttonSize,
        y: 400,
      });
      i++;
    }
    // plantTypeToEmoji.forEach((_value, key) => {
    //   this.addPlantButton(key, {
    //     x: intialButton.x + i * this.buttonSize,
    //     y: 400,
    //   });
    //   i++;
    // });

    this.createEmojiButton(480, 400, "🚜", () => {
      this.board.harvestPlant(this.player.point);
    });
    this.createEmojiButton(530, 400, "🕰️", () => {});

    this.add.rectangle();
  }

  addDirectionButton(direction: string, dirX: number, dirY: number) {
    const button = document.querySelector(`#${direction}Button`);
    button?.addEventListener("click", () => {
      this.player.move(dirX, dirY);
      this.onActionClicked();
    });
  }

  addPlantButton(plantName: PlantType, point: Point) {
    // const pt = plantName as string;
    this.add
      .text(point.x, point.y, plantTypeToEmoji[plantName])
      .setInteractive()
      .setFontSize("20pt")
      .on("pointerdown", () => {
        this.board.placePlant(this.player.point, plantName);
        this.onActionClicked();
      });
  }

  onActionClicked() {
    // Handle button click
    //console.log("click");this.add.text(point.x, point.y, plantTypeToEmoji.get(plantName)!)
    // console.log("click");

    this.gameHistory.push(this.lastMove);
    this.lastMove = this.board.exportTo();

    this.redoHistory = [];

    if (this.board.haveWon()) {
      this.add.text(50, 50, "YOU WON\n!1!!1!!1!!!!").setFontSize("100pt");
    }
    this.board.changeTime();
    this.redraw();
  }

  popPush(history1: string[], history2: string[]) {
    if (history1.length == 0) {
      return;
    }
    const recent = history1.pop()!;
    history2.push(recent);

    this.board.importFrom(recent);
    this.player = this.board.getOnePlayer();
    this.redraw();
  }

  undo() {
    if (this.gameHistory.length == 0) {
      return;
    }

    const recent = this.gameHistory.pop()!;
    this.redoHistory.push(this.board.exportTo());

    this.board.importFrom(recent);
    this.player = this.board.getOnePlayer();
    this.redraw();
  }

  redo() {
    if (this.redoHistory.length == 0) {
      return;
    }

    const recent = this.redoHistory.pop()!;
    this.gameHistory.push(this.board.exportTo());
    this.board.importFrom(recent);
    this.player = this.board.getOnePlayer();
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

  createEmojiButton(x: number, y: number, emoji: string, callback: () => void) {
    const emojiButton = this.add
      .text(x, y, emoji)
      .setInteractive()
      .setFontSize("30pt")
      .on("pointerdown", () => {
        callback();
        this.onActionClicked();
      });

    return emojiButton;
  }
  //Called every tick
  //Maybe redraw the screen only when there is a screen change
  update() {}
}
