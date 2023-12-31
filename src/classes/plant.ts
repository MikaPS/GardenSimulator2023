/* eslint-disable no-unused-vars */

import { Point } from "./gameWorld.ts";
import { PlantDefinitionLanguage, GrowthContext } from "./plantDefinitions.ts";

export const BUFFER_SIZE: number = 25;
export const PLANT_TYPE_POS = 24;
export class InternalPlant {
  private buffer = new ArrayBuffer(BUFFER_SIZE);
  private view = new DataView(this.buffer);

  private X_POS = 0;
  private Y_POS = 8;
  private CURRRENT_LEVEL_POS = 16;
  private MAX_LEVEL_POS = 20;

  public emoji: string = "NOT SET";
  public name: string = "NOT SET";

  constructor(point: Point = { x: 0, y: 0 }) {
    /*
    x: 0-7
    y: 8-15
    currentLevel: 16-19
    maxLevel: 20-23
    plantName: 24
    */
    const defaultStartingLevel = 1;
    const defaultMaxLevel = 15;

    this.view.setFloat64(this.X_POS, point.x);
    this.view.setFloat64(this.Y_POS, point.y);
    this.view.setFloat32(this.CURRRENT_LEVEL_POS, defaultStartingLevel);
    this.view.setFloat32(this.MAX_LEVEL_POS, defaultMaxLevel);
    this.view.setUint8(PLANT_TYPE_POS, -1);
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
  get plantName(): string {
    return this.name;
  }

  set plantName(name: string) {
    this.name = name;
  }

  get plantID(): number {
    return this.view.getUint8(PLANT_TYPE_POS);
  }
  set plantID(id: number) {
    this.view.setUint8(PLANT_TYPE_POS, id);
  }

  getKey(): string {
    return JSON.stringify(this.point);
  }

  //return full buffer for saving
  exportToByteArray(): ArrayBuffer {
    return this.buffer;
  }

  //import full buffer for loading
  importFromByteArray(byteArray: ArrayBuffer) {
    this.buffer = byteArray;
    this.view = new DataView(this.buffer);
  }

  //takes a context and changes level based that
  levelUp(ctx: GrowthContext) {
    if (this.canLevelUp(ctx)) {
      const v = this.clamp(0, this.maxLevel, this.currentLevel + 1);
      this.currentLevel = v;
    }
  }
  //place holder to be changed by plantDefinitions
  canLevelUp: (context: GrowthContext) => boolean = (_ctx) => false;

  //Clamps val between the min and max
  clamp(min: number, max: number, val: number) {
    return Math.max(min, Math.min(max, val));
  }

  getEmoji(): string {
    return this.emoji;
  }

  //places in inventory by moving to the inventory part of the screen
  placeInventory(x: number, index: number) {
    this.point = { x: x, y: index / 2.7 + 1.5 };
  }

  getGrowPercentage() {
    return this.currentLevel / this.maxLevel;
  }
  isReady() {
    return this.currentLevel >= this.maxLevel;
  }
}
//Used to set custom functions for each plant
export function internalPlantCompiler(
  plantDefinition: ($: PlantDefinitionLanguage) => void,
): InternalPlant {
  const plant = new InternalPlant();
  const dsl: PlantDefinitionLanguage = {
    name(name: string): void {
      plant.plantName = name;
    },
    emoji(emoji: string): void {
      plant.emoji = emoji;
    },
    plantID(id) {
      plant.plantID = id;
    },
    //each plant can have a different growth function
    growsWhen(growsWhen: (context: GrowthContext) => boolean): void {
      plant.canLevelUp = (ctx) => {
        return growsWhen(ctx);
      };
    },
  };
  plantDefinition(dsl);
  return plant;
}
