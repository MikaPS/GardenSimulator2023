import { internalPlantCompiler } from "./plant";

export interface GrowthContext {
  nearBySamePlants: number;
  nearByDifferentPlants: number;
  sunLevel: number;
  waterLevel: number;
}

export interface PlantDefinitionLanguage {
  name(name: string): void;
  emoji(emoji: string): void;
  plantID(id: number): void;
  growsWhen(growsWhen: (context: GrowthContext) => boolean): void;
}

export const allPlantDefinitions = [
  function nullPlant($: PlantDefinitionLanguage) {
    $.name("null plant");
    $.emoji("💀");
    $.plantID(0);
    $.growsWhen((ctx: GrowthContext) => {
      ctx;
      return false;
    });
  },
  function sunflower($: PlantDefinitionLanguage) {
    $.name("sunflower");
    $.emoji("🌻");
    $.plantID(1);
    $.growsWhen((ctx: GrowthContext) => {
      if (ctx.nearByDifferentPlants > 0) {
        return false;
      }
      if (ctx.nearBySamePlants <= 1) {
        return false;
      }

      return true;
    });
  },
  function apple($: PlantDefinitionLanguage) {
    $.name("appleTree");
    $.emoji("🍎");
    $.plantID(2);
    $.growsWhen((ctx: GrowthContext) => {
      if (ctx.nearByDifferentPlants > 0) {
        return false;
      }
      if (ctx.nearBySamePlants > 0) {
        return false;
      }

      return true;
    });
  },
  function lilyOfTheValley($: PlantDefinitionLanguage) {
    $.name("lilyOfTheValley");
    $.emoji("🌼");
    $.plantID(3);
    $.growsWhen((ctx: GrowthContext) => {
      if (ctx.sunLevel > 2) {
        return false;
      }
      if (ctx.waterLevel <= 20) {
        return false;
      }

      return true;
    });
  },
];

export class PlantUtilityFunctions {
  allDummyPlants = allPlantDefinitions.map(internalPlantCompiler);

  getIDfromName(type: string): number {
    let foundId = -1;
    this.allDummyPlants.forEach((dummy) => {
      if (dummy.name === type) {
        foundId = dummy.plantID;
        return;
      }
    });
    return foundId;
  }

  getEmojifromName(name: string): string {
    let foundEmoji = "NO EMOJI";

    this.allDummyPlants.forEach((dummy) => {
      if (dummy.name === name) {
        foundEmoji = dummy.emoji;
        return;
      }
    });
    return foundEmoji;
  }
}
