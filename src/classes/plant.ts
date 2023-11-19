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
  level: number;

  constructor(point: Point, pType: PlantType) {
    this.point = point;
    this.level = 1;
    this.plantType = pType;
  }

  levelUp(sunMod: number, waterMod: number, timeMod: number) {
    this.level += sunMod * waterMod * timeMod;
  }

  getEmoji(): string {
    return plantTypeToEmoji.get(this.plantType)!;
  }
}
