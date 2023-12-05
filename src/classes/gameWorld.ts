import { Player } from "./player.ts";
import {
  InternalPlant,
  BUFFER_SIZE,
  internalPlantCompiler,
  PLANT_TYPE_POS,
} from "./plant.ts";
import { PlantGrid } from "./plantGrid.ts";

import { GrowthContext, allPlantDefinitions } from "./plantDefinitions.ts";
// import { PlantDefinitionLanguage } from '../scenarios/plantDefenitions';
// import { internalPlantCompiler } from './plant';

export interface Point {
  x: number;
  y: number;
}

export interface WinPair {
  plantName: string;
  amount: number;
}

interface SaveState {
  gameState: string;
  playerPoints: string;
  playerInventory: string;
  sunMod: number;
  waterMod: number;
  time: number;
}

export class GameWorld {
  private cellWidth = 50;
  private width = 12;
  private height = 10;
  private numPlayers = 0;
  // Buffersize works for only plants, if we want to add the player we need to make it bigger
  public gameState = new PlantGrid(
    this.width,
    this.height,
    BUFFER_SIZE,
    this.numPlayers + 1,
  );

  //Background layer
  playerInventory: InternalPlant[] = [];
  sunMod: number = 1;
  waterMod: number = 1;
  time: number = 1;
  event = new Event("updating-board");

  private padding = { x: 0, y: 3 };

  mySavedData: PlantGrid[] = [];
  constructor() {
    for (let i: number = 0; i < 3; i++) {
      this.mySavedData.push(
        new PlantGrid(
          this.width,
          this.height,
          BUFFER_SIZE,
          this.numPlayers + 1,
        ),
      );
    }
  }

  // LOCAL STORAGE
  saveData(id: number) {
    const dataString = this.exportTo();
    localStorage.setItem(JSON.stringify(id), dataString);
  }

  // Load data from the local storage
  loadData(id: number) {
    const dataString = localStorage.getItem(JSON.stringify(id))!;
    this.importFrom(dataString);
  }

  //Export entire gameworld to a string
  exportTo(): string {
    //Export gameState - Has to be an array of byte arrays
    const savedPlantMap = this.exportPlants();
    const savedPlayerList = this.exportPlayers();
    const savedInventoryList = this.exportInventory();

    // export save state
    const saveState: SaveState = {
      gameState: JSON.stringify(Array.from(savedPlantMap)),
      playerPoints: JSON.stringify(savedPlayerList),
      playerInventory: JSON.stringify(savedInventoryList),
      sunMod: this.sunMod,
      waterMod: this.waterMod,
      time: this.time,
    };

    return JSON.stringify(saveState);
  }

  //Import entire world from a string
  importFrom(state: string) {
    const saveState: SaveState = JSON.parse(state);

    this.gameState = new PlantGrid(
      this.width,
      this.height,
      BUFFER_SIZE,
      this.numPlayers,
    );

    let gameStateList: Map<string, string> = JSON.parse(saveState.gameState);
    gameStateList = new Map(gameStateList);

    //Import Plants, Inventory, and Players from the saveState object
    this.importPlants(gameStateList);
    this.importInventory(saveState.playerInventory);
    this.importPlayers(saveState.playerPoints);

    //import world stats
    this.sunMod = saveState.sunMod;
    this.waterMod = saveState.waterMod;
    this.time = saveState.time;
  }

  // Convert ArrayBuffer to base64 string
  arrayBufferToString(buffer: ArrayBuffer): string {
    const binary = new Uint8Array(buffer);
    const byteArray = Array.from(binary);
    const base64 = btoa(String.fromCharCode.apply(null, byteArray));
    return base64;
  }

  // Convert base64 string back to ArrayBuffer
  stringToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  isValidBase64(str: string): boolean {
    // check if the string is a valid base64-encoded string
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;

    return base64Regex.test(str);
  }

  getOnePlayer(): Player {
    return this.gameState.getPlayer(0);
  }

  //Attempt to Place a plant of ID at a point
  placePlant(point: Point, plantId: number) {
    const key = JSON.stringify(point);

    if (this.gameState.has(key)) {
      //Plant already exists at location
      return;
    }

    //Place a new plant
    const newPlant = internalPlantCompiler(allPlantDefinitions[plantId]);
    newPlant.point = point;

    this.gameState.set(key, newPlant);
  }

  //Attempt to harvest a plant
  harvestPlant(point: Point) {
    const key = JSON.stringify(point);
    if (!this.gameState.has(key)) {
      //Plant doesnt exist, do not do anything
      return;
    }
    const plantToHarvest: InternalPlant = this.gameState.get(key)!;

    //If plant is harvestable
    if (plantToHarvest.isReady()) {
      this.playerInventory.push(plantToHarvest);
      plantToHarvest.placeInventory(12, this.playerInventory.length);
      this.gameState.delete(key);
    }
    //Send boardChanged event;
  }

  //Tick the game world
  changeTime() {
    this.time += 1;

    //Randomly create new sun values
    this.sunMod = Math.floor(Math.random() * 3);

    //Iterate through each plant and send levelUp command (plant will level up if possible)
    this.gameState.forEach((plant: InternalPlant) => {
      plant.levelUp(this.getGrowthContext(plant.point));
      const key = plant.getKey();
      this.gameState.set(key, plant);
    });

    //Add water to soil
    this.waterMod += Math.floor(Math.random() * 5) - this.gameState.size;
    if (this.waterMod <= 0) {
      this.waterMod = 1;
    }
  }

  //Gets the growth context for a point in game, useful for leveling up plants
  getGrowthContext(point: Point): GrowthContext {
    let countSame = 0;
    let countDiff = 0;
    const plantID = this.gameState.getID(JSON.stringify(point));

    const { x, y } = point;

    //Check in a + around a specific plant
    //Points to check around a point
    const directions = [
      { x: x, y: y - 1 },
      { x: x, y: y + 1 },
      { x: x - 1, y: y },
      { x: x + 1, y: y },
    ];

    directions.forEach((direction) => {
      if (this.gameState.has(JSON.stringify(direction))) {
        const newID = this.gameState.getID(JSON.stringify(direction));
        newID == plantID ? countSame++ : countDiff++;
      }
    });

    return {
      waterLevel: this.waterMod,
      sunLevel: this.sunMod,
      nearBySamePlants: countSame,
      nearByDifferentPlants: countDiff,
    };
  }

  //Create a new player in the world
  createPlayer(point: Point) {
    const newPlayer = new Player(point, this.numPlayers);
    const key = JSON.stringify(point);
    this.gameState.setPlayer(key, this.numPlayers);
    this.numPlayers += 1;
    return newPlayer;
  }

  //Draw all objects to the screen
  drawTo(scene: Phaser.Scene): Phaser.GameObjects.Text[] {
    const drawArray: Phaser.GameObjects.Text[] = [];

    //Draw all the plants
    this.gameState.forEach((plant: InternalPlant) => {
      drawArray.push(this.drawPlant(plant, scene));
    });

    //Draw all players
    for (const player of this.gameState.iteratePlayers()) {
      drawArray.push(this.drawPlayer(player, scene));
    }

    //draw inventory
    this.playerInventory.forEach((plant: InternalPlant) => {
      drawArray.push(this.drawPlant(plant, scene));
    });

    return drawArray;
  }

  // Check if the board is in a winning state given a win condition (array of Winning Pairs AKA how many of each plant need to be in the inventory
  haveWon(winningCondition: WinPair[]): boolean {
    const countMap = new Map<string, number>();
    this.playerInventory.forEach((plant: InternalPlant) => {
      if (countMap.has(plant.plantName)) {
        let val = countMap.get(plant.plantName)!;
        val++;
        countMap.set(plant.plantName, val);
      } else {
        countMap.set(plant.plantName, 1);
      }
    });
    let hasWon = true;

    winningCondition.forEach((condition: WinPair) => {
      const plantName = condition.plantName;
      const amount = condition.amount;
      if (
        countMap.get(plantName) === undefined ||
        countMap.get(plantName)! < amount
      ) {
        hasWon = false;
        return;
      }
    });
    return hasWon;
  }

  //Draw plant to screen
  private drawPlant(
    plant: InternalPlant,
    scene: Phaser.Scene,
  ): Phaser.GameObjects.Text {
    const t = scene.add.text(
      plant.point.x * this.cellWidth,
      plant.point.y * this.cellWidth,
      plant.getEmoji(),
    );

    t.setPadding(this.padding);
    t.setCrop(0, this.checkLevel(plant), t.width, t.height);
    return t;
  }

  //draw player to screen
  private drawPlayer(
    player: Player,
    scene: Phaser.Scene,
  ): Phaser.GameObjects.Text {
    const t = scene.add.text(
      player.point.x * this.cellWidth,
      player.point.y * this.cellWidth,
      "🕺",
      { padding: this.padding },
    );
    return t;
  }

  //Grabs the percentage complete of a plant (used to crop the emoji so plants 'grow')
  private checkLevel(plant: InternalPlant) {
    //Max is 15?
    const max = 14;
    return max - max * plant.getGrowPercentage();
  }

  //export all plants to a map of stringified buffers
  private exportPlants() {
    const savedPlantMap = new Map<string, string>();
    this.gameState.forEach((plant) => {
      const key = plant.getKey();

      const BA = plant.exportToByteArray();

      savedPlantMap.set(key, this.arrayBufferToString(BA));
    });

    const savedPlayerList: Point[] = [];
    for (const player of this.gameState.iteratePlayers()) {
      savedPlayerList.push(player.point);
    }
    return savedPlantMap;
  }

  private exportPlayers() {
    const savedPlayerList: Point[] = [];
    for (const player of this.gameState.iteratePlayers()) {
      savedPlayerList.push(player.point);
    }

    return savedPlayerList;
  }

  private exportInventory() {
    const savedInventoryList: string[] = [];
    this.playerInventory.forEach((plant) => {
      const BA = plant.exportToByteArray();
      const str = this.arrayBufferToString(BA);
      savedInventoryList.push(str);
    });

    return savedInventoryList;
  }

  //Import plants from a map of (position keys to plant data)
  private importPlants(gameStateMap: Map<string, string>) {
    if (gameStateMap.size > 0) {
      gameStateMap.forEach((buff: string, key: string) => {
        const BF = this.stringToArrayBuffer(buff);
        const view = new DataView(BF);
        const id = view.getUint8(PLANT_TYPE_POS);
        const plant = internalPlantCompiler(allPlantDefinitions[id]);
        plant.importFromByteArray(BF);
        this.gameState.set(key, plant);
      });
    }
  }

  //Import inventory from JSON string
  private importInventory(saveStateInventoryString: string) {
    this.playerInventory = [];
    const inventoryList = JSON.parse(saveStateInventoryString);
    if (inventoryList.length > 0) {
      inventoryList.forEach((buff: string) => {
        const BF = this.stringToArrayBuffer(buff);
        const view = new DataView(BF);
        const id = view.getUint8(PLANT_TYPE_POS);
        const plant = internalPlantCompiler(allPlantDefinitions[id]);
        plant.importFromByteArray(BF);
        this.playerInventory.push(plant);
      });
    }
  }

  //Import players from JSON string
  private importPlayers(playerPointString: string) {
    const points = JSON.parse(playerPointString);
    this.gameState.deletePlayers();
    this.numPlayers = 0;
    points.forEach((p: Point, i: number) => {
      this.gameState.setPlayer(JSON.stringify(p), i);
      this.numPlayers += 1;
    });
  }
}
