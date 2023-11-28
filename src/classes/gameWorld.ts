import { Plant, PlantType } from "./plant.ts";
import { Player } from "./player.ts";
import { BUFFER_SIZE } from "./plant.ts";
import { DataMap } from "./dataMap.ts";

export interface Point {
  x: number;
  y: number;
}

interface SaveState {
  plantLayer: string;
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

  private plantLayer = new DataMap(this.width, this.height, BUFFER_SIZE);
  // private view = new DataView(this.plantLayer);
  //plantLayer = new Map<string, Plant>();

  playerLayer: Player[] = [];

  //Background layer
  playerInventory: Plant[] = [];
  sunMod: number = 1;
  waterMod: number = 1;
  time: number = 1;
  event = new Event("updating-board");

  private padding = { x: 0, y: 3 };
  private winAmount = 5;

  // cellArray = new Array(100);

  constructor() {}

  exportTo() {
    //Export plantLayer - Has to be an array of byte arrays
    const savedPlantMap = new Map<string, string>();
    this.plantLayer.forEach((plant) => {
      const key = plant.getKey();

      const BA = plant.exportToByteArray();

      savedPlantMap.set(key, this.arrayBufferToBase64(BA));
    });

    const savedPlayerList: Point[] = [];
    this.playerLayer.forEach((player) => {
      savedPlayerList.push(player.point);
    });

    const savedInventoryList: string[] = [];
    this.playerInventory.forEach((plant) => {
      const BA = plant.exportToByteArray();
      const str = this.arrayBufferToBase64(BA);
      savedInventoryList.push(str);
    });

    const saveState: SaveState = {
      plantLayer: JSON.stringify(Array.from(savedPlantMap)),
      playerPoints: JSON.stringify(savedPlayerList),
      playerInventory: JSON.stringify(savedInventoryList),
      sunMod: this.sunMod,
      waterMod: this.waterMod,
      time: this.time,
    };

    return JSON.stringify(saveState);
    //Export playerLayer - Byte array?
  }
  importFrom(state: string) {
    const saveState: SaveState = JSON.parse(state);

    //Import Plants
    this.plantLayer = new DataMap(this.width, this.height, BUFFER_SIZE);

    // this.plantLayer = new Map<string, Plant>();
    let plantLayerList: Map<string, string> = JSON.parse(saveState.plantLayer);
    plantLayerList = new Map(plantLayerList);
    if (plantLayerList.size > 0) {
      plantLayerList.forEach((buff: string, key: string) => {
        const BF = this.base64ToArrayBuffer(buff);
        const plant = new Plant();
        plant.importFromByteArray(BF);
        this.plantLayer.set(key, plant);
      });
    }

    //List of base64 strings
    this.playerInventory = [];
    const inventoryList = JSON.parse(saveState.playerInventory);
    if (inventoryList.length > 0) {
      inventoryList.forEach((buff: string) => {
        const BF = this.base64ToArrayBuffer(buff);
        const plant = new Plant();
        plant.importFromByteArray(BF);
        this.playerInventory.push(plant);
      });
    }

    //Import Players
    const points = JSON.parse(saveState.playerPoints);
    this.playerLayer = [];
    points.forEach((p: Point) => {
      this.playerLayer.push(new Player(p));
    });

    //import world stats
    this.sunMod = saveState.sunMod;
    this.waterMod = saveState.waterMod;
    this.time = saveState.time;

    // this.playerLayer[0].move(-1, 1);
  }
  // Convert ArrayBuffer to base64 string
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = new Uint8Array(buffer);
    const byteArray = Array.from(binary);
    const base64 = btoa(String.fromCharCode.apply(null, byteArray));
    return base64;
  }

  // Convert base64 string back to ArrayBuffer
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  getOnePlayer(): Player {
    return this.playerLayer[0];
  }

  placePlant(point: Point, plantType: PlantType) {
    const key = JSON.stringify(point);
    console.log("PlacePlant");
    if (this.plantLayer.has(key)) {
      console.log("a plant is already here");
      return;
    }
    const newPlant = new Plant(point, plantType);
    this.plantLayer.set(key, newPlant);
    console.log("new plant");

    // this.exportTo();
    //Send boardChanged event;
  }

  harvestPlant(point: Point) {
    const key = JSON.stringify(point);
    if (!this.plantLayer.has(key)) {
      return;
    }
    const plantToHarvest: Plant = this.plantLayer.get(key)!;

    if (plantToHarvest.isReady()) {
      this.playerInventory.push(plantToHarvest);
      plantToHarvest.placeInventory(12, -this.playerInventory.length);
      this.plantLayer.delete(key);
    }
    //Send boardChanged event;
  }

  changeTime() {
    this.time += 1;
    this.sunMod = Math.floor(Math.random() * 3);
    this.plantLayer.forEach((plant: Plant) => {
      plant.levelUp(
        this.sunMod,
        this.waterMod,
        this.checkPlantsNearby(plant.point),
      );
    });
    this.waterMod = Math.floor(Math.random() * 5) - this.plantLayer.size();
    if (this.waterMod <= 0) {
      this.waterMod = 1;
    }

    //console.log("have we won? ", this.haveWon());
    //Send boardChanged event;
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
      //console.log(JSON.stringify(direction));
      if (this.plantLayer.has(JSON.stringify(direction))) {
        count++;
      }
    });
    return count;
  }

  createPlayer(point: Point): Player {
    const newPlayer = new Player(point);
    this.playerLayer.push(newPlayer);
    //Send BoardChanged event;

    return newPlayer;
  }

  drawTo(scene: Phaser.Scene): Phaser.GameObjects.Text[] {
    //backgroudLayer.foreach()
    const drawArray: Phaser.GameObjects.Text[] = [];
    // console.log(this.plantLayer);
    //console.log("Size: " + this.plantLayer.size());
    this.plantLayer.forEach((plant: Plant) => {
      //console.log(plant);
      drawArray.push(this.drawPlant(plant, scene));
    });
    console.log("draw to, number of drawings: ");
    console.log(drawArray.length);
    this.playerLayer.forEach((player) => {
      drawArray.push(this.drawPlayer(player, scene));
    });

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
    console.log("in draw plant: ");
    console.log(t);
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
