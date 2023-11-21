/* eslint-disable no-unused-vars */

import { Point } from "./gameWorld.ts";

export type PlantType = "Sunflower" | "AppleTree" | "LilyOfTheValley";

export const plantTypeToEmoji: Map<PlantType, string> = new Map([
  ["Sunflower", "🌻"],
  ["AppleTree", "🍎"],
  ["LilyOfTheValley", "🌼"],
]);

export class Plant {
  point: Point;
  plantType: PlantType;
  currentLevel: number;
  maxLevel: number = 50;

  constructor(point: Point, pType: PlantType) {
    this.point = { x: point.x, y: point.y };
    this.currentLevel = 1;
    this.plantType = pType;
  }

  levelUp(sunMod: number, waterMod: number, numOfPlants: number) {
    if (numOfPlants < 2){
      this.currentLevel = this.clamp(0,this.maxLevel,this.currentLevel + (sunMod * waterMod));
    }
  }
  clamp(min: number, max: number, val: number) {
    return Math.max(min, (Math.min(max, val)));
  }

  getEmoji(): string {
    return plantTypeToEmoji.get(this.plantType)!;
  }
  placeInventory(index: number) {
    this.point.x = 20;
    this.point.y = index / 1.7;
  }
  getGrowPercentage() {
    return this.currentLevel / this.maxLevel;
  }
  isReady() {
    return this.currentLevel >= this.maxLevel;
  }
}
