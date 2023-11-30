import { Plant, PlantType } from "./plant.ts";
import { Player } from "./player.ts";
import { BUFFER_SIZE } from "./plant.ts";
import { DataMap } from "./dataMap.ts";

export interface Point {
  x: number;
  y: number;
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
  public gameState = new DataMap(
    this.width,
    this.height,
    BUFFER_SIZE,
    8 * (this.numPlayers + 1),
  );
  // private view = new DataView(this.gameState);
  //gameState = new Map<string, Plant>();

  // playerLayer: Player[] = [];

  //Background layer
  playerInventory: Plant[] = [];
  sunMod: number = 1;
  waterMod: number = 1;
  time: number = 1;
  event = new Event("updating-board");

  private padding = { x: 0, y: 3 };
  private winAmount = 5;

  mySavedData: DataMap[] = [];
  constructor() {
    for (let i: number = 0; i < 3; i++) {
      this.mySavedData.push(
        new DataMap(
          this.width,
          this.height,
          BUFFER_SIZE,
          8 * (this.numPlayers + 1),
        ),
      );
    }
  }

  // LOCAL STORAGE
  saveData(id: number) {
    console.log("id is: ", id);
    const inSaved = localStorage.getItem("savedData")!; //get data

    // If we dont have saved data
    if (inSaved == undefined) {
      // Upload current state
      this.mySavedData[id] = this.gameState;
      const str = this.mySavedData.join("||");
      localStorage.setItem("savedData", str);
      return;
    }
    // If we have data, parse it with split
    const savedData: string[] = inSaved.split("||");
    savedData[id] = this.arrayBufferToString(this.gameState.gridBuffer);

    // Takes all gridBuffers from the data maps and adds them to a string
    const str = savedData.join("||");
    localStorage.setItem("savedData", str);
  }

  // Load data from the local storage
  loadData(id: number) {
    const str = localStorage.getItem("savedData")!;
    if (str == undefined) {
      return;
    }
    const savedData = str.split("||");
    this.gameState.gridBuffer = this.stringToArrayBuffer(savedData[id]);
    this.gameState.view = new DataView(this.gameState.gridBuffer);
  }

  exportTo() {
    //Export gameState - Has to be an array of byte arrays
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
    // this.playerLayer.forEach((player) => {
    //   savedPlayerList.push(player.point);
    // });

    const savedInventoryList: string[] = [];
    this.playerInventory.forEach((plant) => {
      const BA = plant.exportToByteArray();
      const str = this.arrayBufferToString(BA);
      savedInventoryList.push(str);
    });

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
  importFrom(state: string) {
    const saveState: SaveState = JSON.parse(state);

    //Import Plants
    this.gameState = new DataMap(
      this.width,
      this.height,
      BUFFER_SIZE,
      this.numPlayers,
    );

    // this.gameState = new Map<string, Plant>();
    let gameStateList: Map<string, string> = JSON.parse(saveState.gameState);
    gameStateList = new Map(gameStateList);
    // let gameStateList: DataMap = JSON.parse(saveState.gameState);
    // gameStateList = new DataMap(this.width, this.height, BUFFER_SIZE);

    if (gameStateList.size > 0) {
      gameStateList.forEach((buff: string, key: string) => {
        const BF = this.stringToArrayBuffer(buff);
        const plant = new Plant();
        plant.importFromByteArray(BF);
        this.gameState.set(key, plant);
      });
    }

    //List of base64 strings
    this.playerInventory = [];
    const inventoryList = JSON.parse(saveState.playerInventory);
    if (inventoryList.length > 0) {
      inventoryList.forEach((buff: string) => {
        const BF = this.stringToArrayBuffer(buff);
        const plant = new Plant();
        plant.importFromByteArray(BF);
        this.playerInventory.push(plant);
      });
    }

    //Import Players
    const points = JSON.parse(saveState.playerPoints);
    this.gameState.deletePlayers();
    this.numPlayers = 0;
    points.forEach((p: Point, i: number) => {
      this.gameState.setPlayer(JSON.stringify(p), i);
      this.numPlayers += 1;
    });
    // this.playerLayer = [];
    // points.forEach((p: Point, i: number) => {
    //   this.playerLayer.push(new Player(p, i));
    // });

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

  getOnePlayer(): Player {
    return this.gameState.getPlayer(0);
    // return this.playerLayer[0];
  }

  placePlant(point: Point, plantType: PlantType) {
    const key = JSON.stringify(point);
    if (this.gameState.has(key)) {
      return;
    }
    const newPlant = new Plant(point, plantType);
    this.gameState.set(key, newPlant);
  }

  harvestPlant(point: Point) {
    const key = JSON.stringify(point);
    if (!this.gameState.has(key)) {
      return;
    }
    const plantToHarvest: Plant = this.gameState.get(key)!;

    if (plantToHarvest.isReady()) {
      this.playerInventory.push(plantToHarvest);
      plantToHarvest.placeInventory(12, this.playerInventory.length);
      this.gameState.delete(key);
    }
    //Send boardChanged event;
  }

  changeTime() {
    this.time += 1;
    this.sunMod = Math.floor(Math.random() * 3);
    this.gameState.forEach((plant: Plant) => {
      plant.levelUp(
        this.sunMod,
        this.waterMod,
        this.checkPlantsNearby(plant.point),
      );
      const key = plant.getKey();
      this.gameState.set(key, plant);
    });
    this.waterMod = Math.floor(Math.random() * 5) - this.gameState.size;
    if (this.waterMod <= 0) {
      this.waterMod = 1;
    }
  }

  checkPlantsNearby(point: Point): number {
    let count = 0;
    const { x, y } = point;
    const directions = [
      { x: x, y: y - 1 },
      { x: x, y: y + 1 },
      { x: x - 1, y: y },
      { x: x + 1, y: y },
    ];

    directions.forEach((direction) => {
      if (this.gameState.has(JSON.stringify(direction))) {
        count++;
      }
    });
    return count;
  }

  createPlayer(point: Point) {
    const newPlayer = new Player(point, this.numPlayers);
    // // this.playerLayer.push(newPlayer);
    const key = JSON.stringify(point);
    this.gameState.setPlayer(key, this.numPlayers);
    this.numPlayers += 1;
    return newPlayer;
  }

  drawTo(scene: Phaser.Scene): Phaser.GameObjects.Text[] {
    //backgroudLayer.foreach()
    const drawArray: Phaser.GameObjects.Text[] = [];
    this.gameState.forEach((plant: Plant) => {
      drawArray.push(this.drawPlant(plant, scene));
    });
    for (const player of this.gameState.iteratePlayers()) {
      drawArray.push(this.drawPlayer(player, scene));
    }
    // this.playerLayer.forEach((player) => {
    //   drawArray.push(this.drawPlayer(player, scene));
    // });

    this.playerInventory.forEach((plant: Plant) => {
      drawArray.push(this.drawPlant(plant, scene));
    });

    return drawArray;
  }

  private drawPlant(
    plant: Plant,
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

  private checkLevel(plant: Plant) {
    //Max is 15?
    const max = 14;
    return max - max * plant.getGrowPercentage();
  }

  haveWon() {
    return this.playerInventory.length > this.winAmount;
  }
}
