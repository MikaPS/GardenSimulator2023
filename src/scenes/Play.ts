import * as Phaser from "phaser";
import * as yaml from "js-yaml";

import { GameWorld } from "../classes/gameWorld.ts";
import { Player } from "../classes/player.ts";
import { WinPair } from "../classes/gameWorld.ts";
import { createMovementButtons } from "../main.ts";
import { PlantUtilityFunctions } from "../classes/plantDefinitions.ts";

import yamldata from "/assets/scenario.yaml?url";

export class Play extends Phaser.Scene {
  board: GameWorld = new GameWorld();
  player: Player = this.board.createPlayer({ x: 0, y: 0 });
  drawnElements: Phaser.GameObjects.Text[] = [];
  currentLevel: string = "0";
  gameHistory: string[] = [];
  redoHistory: string[] = [];
  availablePlants: string[] = [];
  winCondition: WinPair[] = [];
  helper: PlantUtilityFunctions = new PlantUtilityFunctions();

  currentSaveFile: number = 0;

  lastMove: string = this.board.exportTo();

  constructor() {
    super("play");
  }

  preload() {
    this.load.text("yamlData", yamldata);
  }

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

    //Attempt to load autosave on website load.
    window.onload = () => {
      if (localStorage.getItem("currentSaveFile") != null) {
        const saveID = JSON.parse(localStorage.getItem("currentSaveFile")!);
        this.loadStateFromID(saveID);
      }
    };

    //Black rectangle for inventory border
    this.add.rectangle(590, 0, 50, 700, 0x000000).setOrigin(0, 0);

    //Load level
    this.loadLevel(this.currentLevel);
    this.createInterface();
    this.redraw();
  }

  //Increment level
  nextLevel() {
    this.currentLevel = (Number(this.currentLevel) + 1).toString();
    this.loadLevel(this.currentLevel);
    this.createInterface();
    this.redraw();
  }

  loadLevel(levelName: string) {
    this.setLevelData(levelName);
    this.board = new GameWorld();
    this.deleteDrawings();
    this.gameHistory = [];
    this.redoHistory = [];
    this.player = this.board.createPlayer({ x: 0, y: 0 });
  }

  setLevelData(levelName: string) {
    // Read from YAML file
    const yamlContent = this.cache.text.get("yamlData");
    // Parse YAML content
    const data: Record<string, any> = yaml.load(yamlContent)!;
    const level = data[levelName];
    if (levelName == "0" || levelName == "1" || levelName == "2") {
      this.availablePlants = level["available_plants"];
      this.winCondition = this.findWinPairs(level);
    }
  }

  //Creates all the buttons below the webpage
  createInterface() {
    this.deleteAllButtons();
    createMovementButtons();
    this.addDirectionButton("⬅️", -1, 0);
    this.addDirectionButton("➡️", 1, 0);
    this.addDirectionButton("⬆️", 0, -1);
    this.addDirectionButton("⬇️", 0, 1);
    this.newLine();

    this.createUndoButton();
    this.createRedoButton();

    this.createPlantButtons(this.availablePlants);
    this.newLine();
    this.createEmojiButton("🚜", () => {
      this.board.harvestPlant(this.player.point);
    });

    this.createEmojiButton("🕰️", () => {});

    this.newLine();
    this.createSaveButtons();

    this.newLine();
    this.createLoadButtons();

    this.newLine();
    this.createTrashButton();
  }

  findWinPairs(level: Record<string, any>): WinPair[] {
    const winCondition = level["win_conditions"];
    const winPairs: WinPair[] = [];

    winCondition.forEach((w: [string, number]) => {
      const winPair = { plantName: w[0], amount: w[1] };
      winPairs.push(winPair);
    });
    return winPairs;
  }

  newLine() {
    this.appendToPage(document.createElement("br"));
  }

  createPlantButtons(plantList: string[]) {
    plantList.forEach((plant: string) => {
      this.addPlantButton(plant);
    });
  }

  createTrashButton() {
    const trashButton = document.createElement("button");
    trashButton.innerHTML = "🗑️";
    trashButton.addEventListener("click", () => {
      localStorage.clear();
    });
    this.appendToPage(trashButton);
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
      this.appendToPage(save);
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
      this.appendToPage(load);
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

  addPlantButton(plantName: string) {
    const button = document.createElement("button");
    const plantId = this.helper.getIDfromName(plantName);
    button.innerHTML = this.helper.getEmojifromName(plantName);
    button.addEventListener("click", () => {
      this.board.placePlant(this.player.point, plantId);
      this.onActionClicked();
    });

    this.appendToPage(button);
  }

  onActionClicked() {
    this.saveStateToID(-1);

    // Handle button click
    this.gameHistory.push(this.lastMove);
    this.lastMove = this.board.exportTo();

    this.redoHistory = [];

    if (this.board.haveWon(this.winCondition)) {
      const winText = this.add
        .text(50, 50, "YOU WON\n!1!!1!!1!!!!")
        .setFontSize("100pt");

      setTimeout(() => {
        winText.text = "";
        this.nextLevel();
      }, 2000);
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
    this.appendToPage(button);

    return button;
  }
  appendToPage(elem: HTMLElement | Element) {
    const buttonHolder = document.getElementById("ButtonHolder");
    buttonHolder?.appendChild(elem);
  }

  deleteAllButtons() {
    const buttonHolder = document.getElementById("ButtonHolder")!;
    buttonHolder.innerHTML = "";
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
}
