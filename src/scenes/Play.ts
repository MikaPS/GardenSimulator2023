import * as Phaser from "phaser";
import { GameWorld } from "../classes/gameWorld.ts";
import { plantTypeToEmoji, PlantType } from "../classes/plant.ts";
import { Player } from "../classes/player.ts";

export default class Play extends Phaser.Scene {
  // private buttonSize = 35;
  board: GameWorld = new GameWorld();
  player: Player = this.board.createPlayer({ x: 0, y: 0 });
  drawnElements: Phaser.GameObjects.Text[] = [];

  gameHistory: string[] = [];
  redoHistory: string[] = [];

  lastMove: string = this.board.exportTo();

  constructor() {
    super("play");
  }

  preload() {}

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

    this.createEmojiButton("🚜", () => {
      this.board.harvestPlant(this.player.point);
    });
    this.createEmojiButton("🕰️", () => {});

    document.body.appendChild(document.createElement("br"));
    for (const key in plantTypeToEmoji) {
      this.addPlantButton(key as PlantType);
    }

    this.add.rectangle();

    // WHY DO WE NEED THIS?
    // const p = new Plant({ x: 0, y: 0 });
    // p.currentLevel = 15;
    // const data = p.exportToByteArray();
    // const p2 = new Plant({ x: 0, y: 0 });
    // p2.importFromByteArray(data);
  }

  addDirectionButton(direction: string, dirX: number, dirY: number) {
    const button = document.querySelector(`#${direction}Button`);
    button?.addEventListener("click", () => {
      this.player.move(dirX, dirY);
      this.board.plantLayer.setPlayer(
        JSON.stringify(this.player.point),
        this.player.id,
      );
      this.onActionClicked();
    });
  }

  addPlantButton(plantName: PlantType) {
    // const pt = plantName as string;
    const button = document.createElement("button");
    button.innerHTML = plantTypeToEmoji[plantName];
    button.addEventListener("click", () => {
      this.board.placePlant(this.player.point, plantName);
      this.onActionClicked();
    });

    document.body.appendChild(button);
  }

  onActionClicked() {
    // Handle button click
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

  createEmojiButton(emoji: string, callback: () => void) {
    const button = document.createElement("button");
    button.innerHTML = emoji;
    button.addEventListener("click", () => {
      callback();
      this.onActionClicked();
    });
    document.body.appendChild(button);

    return button;
  }
  //Called every tick
  //Maybe redraw the screen only when there is a screen change
  update() {}
}
