/* eslint-disable no-unused-vars */

import { Point } from "./gameWorld.ts";

export type PlantType = "sunflower" | "appleTree" | "lilyOfTheValley";
const plantTypeNumbers: Record<number | PlantType, PlantType | number> = {
  1: "sunflower",
  sunflower: 1,

  2: "appleTree",
  appleTree: 2,

  3: "lilyOfTheValley",
  lilyOfTheValley: 3,
};

export const plantTypeToEmoji: Record<PlantType, string> = {
  sunflower: "🌻",
  appleTree: "🍎",
  lilyOfTheValley: "🌼",
};

export const BUFFER_SIZE: number = 25;

export class Plant {
  private buffer = new ArrayBuffer(BUFFER_SIZE);
  private view = new DataView(this.buffer);

  // point: Point;
  // plantType: PlantType;
  // currentLevel: number;
  // maxLevel: number = 50;
  private X_POS = 0;
  private Y_POS = 8;
  private CURRRENT_LEVEL_POS = 16;
  private MAX_LEVEL_POS = 20;
  private PLANT_TYPE_POS = 24;

  constructor(point: Point = { x: 0, y: 0 }, pType: PlantType = "sunflower") {
    /*
    x: 0-7
    y: 8-15
    currentLevel: 16-19
    maxLevel: 20-23
    plantType: 24
    */

    const defaultStartingLevel = 1;
    const defaultMaxLevel = 12;

    this.view.setFloat64(this.X_POS, point.x);
    this.view.setFloat64(this.Y_POS, point.y);
    this.view.setFloat32(this.CURRRENT_LEVEL_POS, defaultStartingLevel);
    this.view.setFloat32(this.MAX_LEVEL_POS, defaultMaxLevel);
    this.view.setUint8(this.PLANT_TYPE_POS, plantTypeNumbers[pType] as number);

    // this.point = { x: point.x, y: point.y };
    // this.currentLevel = 1;
    // this.plantType = pType;
  }

  // get/set point
  get point(): Point {
    return {
      x: this.view.getFloat64(this.X_POS),
      y: this.view.getFloat64(this.Y_POS),
    };
  }
  set point(val: Point) {
    this.view.setFloat64(this.X_POS, val.x);
    this.view.setFloat64(this.Y_POS, val.y);
  }

  // get/set current level
  get currentLevel(): number {
    return this.view.getFloat32(this.CURRRENT_LEVEL_POS);
  }
  set currentLevel(val: number) {
    this.view.setFloat32(this.CURRRENT_LEVEL_POS, val);
  }

  // get/set max level
  get maxLevel(): number {
    return this.view.getFloat32(this.MAX_LEVEL_POS);
  }
  set maxLevel(val: number) {
    this.view.setFloat32(this.MAX_LEVEL_POS, val);
  }

  // get/set plant type
  get plantType(): PlantType {
    const pType = plantTypeNumbers[
      this.view.getUint8(this.PLANT_TYPE_POS)
    ] as PlantType;
    return pType;
  }
  set plantType(val: PlantType) {
    const pType = plantTypeNumbers[val] as number;
    this.view.setUint8(this.PLANT_TYPE_POS, pType);
  }

  getKey(): string {
    return JSON.stringify(this.point);
  }

  exportToByteArray(): ArrayBuffer {
    return this.buffer;
  }

  importFromByteArray(byteArray: ArrayBuffer) {
    this.buffer = byteArray;
    this.view = new DataView(this.buffer);
  }

  levelUp(sunMod: number, waterMod: number, numOfPlants: number) {
    if (numOfPlants < 2) {
      this.currentLevel = this.clamp(
        0,
        this.maxLevel,
        this.currentLevel + sunMod * waterMod,
      );
    }
  }

  clamp(min: number, max: number, val: number) {
    return Math.max(min, Math.min(max, val));
  }

  getEmoji(): string {
    return plantTypeToEmoji[this.plantType];
  }

  placeInventory(x: number, index: number) {
    this.point = { x: x, y: index / 2.7 };
  }

  getGrowPercentage() {
    return this.currentLevel / this.maxLevel;
  }
  isReady() {
    return this.currentLevel >= this.maxLevel;
  }
}
