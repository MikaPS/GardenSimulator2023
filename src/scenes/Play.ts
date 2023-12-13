import * as Phaser from "phaser";
import * as yaml from "js-yaml";

import { GameWorld } from "../classes/gameWorld.ts";
import { Player } from "../classes/player.ts";
import { WinPair } from "../classes/gameWorld.ts";
import { createLanguageButtons, createMovementButtons } from "../main.ts";
import { PlantUtilityFunctions } from "../classes/plantDefinitions.ts";
import { LevelCompleteTranslation } from "../assets/translations.ts";

import yamldata from "../../public/assets/scenario.yaml?url";
//import yamldata from "assets/scenario.yaml?url";
console.log("yamldata:", yamldata);

// import image1 from "/assets/tiny_turnip.jpg";
// import image2 from "/assets/tiny_turnip512.jpg";

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
  currentLanguage: string = "English";

  currentSaveFile: number = 0;

  lastMove: string = this.board.exportTo();

  constructor() {
    super("play");
  }

  preload() {
    console.log("load text");
    //const yamlString = yamldata as string;
    const yamlString = `data:text/yaml;base64,MDoNCiAgYXZhaWxhYmxlX3BsYW50czoNCiAgICAtIHN1bmZsb3dlcg0KICB3aW5fY29uZGl0aW9uczoNCiAgICAtIC0gc3VuZmxvd2VyDQogICAgICAtIDINCjE6DQogIGF2YWlsYWJsZV9wbGFudHM6DQogICAgLSBzdW5mbG93ZXINCiAgICAtIGFwcGxlVHJlZQ0KICB3aW5fY29uZGl0aW9uczoNCiAgICAtIC0gc3VuZmxvd2VyDQogICAgICAtIDINCiAgICAtIC0gYXBwbGVUcmVlDQogICAgICAtIDYNCjI6DQogIGF2YWlsYWJsZV9wbGFudHM6DQogICAgLSBzdW5mbG93ZXINCiAgICAtIGFwcGxlVHJlZQ0KICAgIC0gbGlseU9mVGhlVmFsbGV5DQogIHdpbl9jb25kaXRpb25zOg0KICAgIC0gLSBzdW5mbG93ZXINCiAgICAgIC0gMg0KICAgIC0gLSBhcHBsZVRyZWUNCiAgICAgIC0gNg0KICAgIC0gLSBsaWx5T2ZUaGVWYWxsZXkNCiAgICAgIC0gMw0K`;

    if (yamlString.indexOf("data:text/yaml;base64,") != -1) {
      console.log("Base64 yaml detected");
      const b64 = yamlString.substring(22);
      console.log("New text|", b64);
      console.log("Decoded text|", atob(b64));
      this.cache.text.add("yamlData", atob(b64));
    } else {
      console.log("Normal yaml detected");
      this.load.text("yamlData", yamldata);
    }
    console.log("----------");
    console.log(this.cache.text.get("yamlData"));
  }

  create() {
    // save initial state when opening it for the first time
    console.log("Play Create() happening");
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
    this.addLanguageButtons();
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
    console.log("Got content:", yamlContent);
    // Parse YAML content
    const data: Record<string, any> = yaml.load(yamlContent)!;
    const level = data[levelName];
    if (level != null) {
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
    let s = "";
    winCondition.forEach((w: [string, number]) => {
      const winPair = { plantName: w[0], amount: w[1] };
      s += "\n" + this.helper.getEmojifromName(w[0]) + "x" + w[1];
      winPairs.push(winPair);
    });
    this.add.text(590, 0, s).setFontSize("12pt");
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
    const undoButton = document.querySelector(`#↩️Button`);
    undoButton?.addEventListener("click", () => {
      this.performUndoRedo(this.gameHistory, this.redoHistory);
    });
  }
  createRedoButton() {
    const redoButton = document.querySelector(`#↪️Button`);
    redoButton?.addEventListener("click", () => {
      this.performUndoRedo(this.redoHistory, this.gameHistory);
    });
  }

  createSaveButtons() {
    const saveArr: string[] = [`#🗄️1Button`, `#🗄️2Button`, `#🗄️3Button`];

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
    const loadArr: string[] = [`#🗃️1Button`, `#🗃️2Button`, `#🗃️3Button`];

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
        .text(0, 50, LevelCompleteTranslation[this.currentLanguage])
        .setFontSize("80pt");

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

  addLanguageButtons() {
    const allLanguages = createLanguageButtons();
    allLanguages.forEach((language) => {
      const button = document.getElementById(language.name)!;
      button.addEventListener("click", () => {
        this.currentLanguage = language.name;
      });
    });
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
