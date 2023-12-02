import * as Phaser from "phaser";
import { GameWorld } from "../classes/gameWorld.ts";
import { plantTypeToEmoji, PlantType } from "../classes/plant.ts";
import { Player } from "../classes/player.ts";

export default class Play extends Phaser.Scene {
  board: GameWorld = new GameWorld();
  player: Player = this.board.createPlayer({ x: 0, y: 0 });
  drawnElements: Phaser.GameObjects.Text[] = [];

  gameHistory: string[] = [];
  redoHistory: string[] = [];

  currentSaveFile: number = 0;

  lastMove: string = this.board.exportTo();

  constructor() {
    super("play");
  }

  preload() {}

  create() {
    // save initial state when opening it for the first time
    if (!localStorage.getItem("firstTimeFlag")) {
      for (let i = 0; i < 3; i++) {
        this.board.saveData(i);
      }
      localStorage.setItem("firstTimeFlag", "true");
      localStorage.setItem("currentSaveFile", JSON.stringify(0));
    }

    // Autosave stuff
    window.onbeforeunload = () => {
      //So autosave doesnt overwrite a save file, write to id -1
      this.saveStateToID(-1);
    };

    window.onload = () => {
      if (localStorage.getItem("currentSaveFile") != null) {
        const saveID = JSON.parse(localStorage.getItem("currentSaveFile")!);
        this.loadStateFromID(saveID);
      }
    };

    // // Set up event listeners
    this.redraw();

    //Rectangle for inventory
    this.add.rectangle(590, 0, 50, 700, 0x000000).setOrigin(0, 0);

    this.addDirectionButton("⬅️", -1, 0);
    this.addDirectionButton("➡️", 1, 0);
    this.addDirectionButton("⬆️", 0, -1);
    this.addDirectionButton("⬇️", 0, 1);

    this.createUndoButton();
    this.createRedoButton();

    this.createEmojiButton("🚜", () => {
      this.board.harvestPlant(this.player.point);
    });

    this.createEmojiButton("🕰️", () => {});

    this.newLine();

    this.createPlantButtons();

    this.newLine();
    this.createSaveButtons();

    this.newLine();
    this.createLoadButtons();

    this.newLine();
    this.createTrashButton();
  }

  newLine() {
    document.body.appendChild(document.createElement("br"));
  }

  createPlantButtons() {
    for (const key in plantTypeToEmoji) {
      this.addPlantButton(key as PlantType);
    }
  }

  createTrashButton() {
    const trashButton = document.createElement("button");
    trashButton.innerHTML = "🗑️";
    trashButton.addEventListener("click", () => {
      localStorage.clear();
    });
    document.body.appendChild(trashButton);
  }

  createUndoButton() {
    const undoButton = document.querySelector(`#undoButton`);
    undoButton?.addEventListener("click", () => {
      this.performUndoRedo(this.gameHistory, this.redoHistory);
    });
  }
  createRedoButton() {
    const redoButton = document.querySelector(`#redoButton`);
    redoButton?.addEventListener("click", () => {
      this.performUndoRedo(this.redoHistory, this.gameHistory);
    });
  }

  createSaveButtons() {
    const saveArr: string[] = [
      `#savefile1Button`,
      `#savefile2Button`,
      `#savefile3Button`,
    ];

    saveArr.forEach((element, id) => {
      const save = document.querySelector(element)!;
      save.addEventListener("click", () => {
        this.saveStateToID(id);
      });
      document.body.appendChild(save);
    });
  }

  saveStateToID(id: number) {
    this.currentSaveFile = id;
    localStorage.setItem(
      "currentSaveFile",
      JSON.stringify(this.currentSaveFile),
    );

    this.board.saveData(id);

    //Save undo/redo to local storage
    const data = {
      gameHistory: JSON.stringify(this.gameHistory),
      redoHistory: JSON.stringify(this.redoHistory),
      lastMove: JSON.stringify(this.lastMove),
    };
    localStorage.setItem(JSON.stringify(id) + "history", JSON.stringify(data));
  }

  createLoadButtons() {
    const loadArr: string[] = [
      `#loadfile1Button`,
      `#loadfile2Button`,
      `#loadfile3Button`,
    ];

    loadArr.forEach((element, id) => {
      const load = document.querySelector(element)!;
      load.addEventListener("click", () => {
        this.loadStateFromID(id);
      });
      document.body.appendChild(load);
    });
  }

  loadStateFromID(id: number) {
    this.board.loadData(id);
    this.currentSaveFile = id;
    localStorage.setItem(
      "currentSaveFile",
      JSON.stringify(this.currentSaveFile),
    );

    this.player = this.board.getOnePlayer();
    this.redraw();

    //Load undo/redo from local storage
    const data: {
      gameHistory: string;
      redoHistory: string;
      lastMove: string;
    } = JSON.parse(localStorage.getItem(JSON.stringify(id) + "history")!) || {
      gameHistory: JSON.stringify([]),
      redoHistory: JSON.stringify([]),
      lastMove: JSON.stringify([]),
    };
    this.gameHistory = JSON.parse(data.gameHistory);
    this.redoHistory = JSON.parse(data.redoHistory);
    this.lastMove = JSON.parse(data.lastMove);
  }

  addDirectionButton(direction: string, dirX: number, dirY: number) {
    const button = document.querySelector(`#${direction}Button`);
    button?.addEventListener("click", () => {
      this.player.move(dirX, dirY);
      this.board.gameState.setPlayer(
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
    this.saveStateToID(-1);

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

  private performUndoRedo(historyList: string[], oppositeList: string[]) {
    if (historyList.length == 0) {
      return;
    }

    const recent = historyList.pop()!;
    oppositeList.push(this.board.exportTo());
    this.board.importFrom(recent);
    this.player = this.board.getOnePlayer();
    this.redraw();
  }

  //Called every tick
  //Maybe redraw the screen only when there is a screen change
  update() {}
}
