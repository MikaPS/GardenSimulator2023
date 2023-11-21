import { Plant, PlantType } from "./plant.ts";
import { Player } from "./player.ts";

export interface Point {
  x: number;
  y: number;
}

export class GameWorld {
  plantLayer = new Map<string, Plant>();
  playerLayer: Player[] = [];

  //Background layer
  playerInventory: Plant[] = [];
  sunMod: number = 1;
  waterMod: number = 1;
  time: number = 1;
  event = new Event("updating-board");

  private cellWidth = 30;
  private padding = { x: 0, y: 3 };

  constructor() {}

  placePlant(point: Point, plantType: PlantType) {
    const key = JSON.stringify(point);
    if (this.plantLayer.has(key)) {
      return;
    }
    const newPlant = new Plant(point, plantType);
    this.plantLayer.set(key, newPlant);
    //Send boardChanged event;
  }

  harvestPlant(point: Point) {
    const key = JSON.stringify(point);
    if (!this.plantLayer.has(key)) {
      return;
    }
    const plantToHarvest: Plant = this.plantLayer.get(key)!;
    this.playerInventory.push(plantToHarvest);
    plantToHarvest.placeInventory(this.playerInventory.length);
    this.plantLayer.delete(key);
    //Send boardChanged event;
  }

  changeTime() {
    this.time += 1;
    this.sunMod = Math.floor(Math.random() * 5);
    this.waterMod = Math.floor(Math.random() * 5);
    //Send boardChanged event;
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
    this.plantLayer.forEach((plant: Plant) => {
      drawArray.push(this.drawPlant(plant, scene));
    });

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
    return 2 * plant.level + 1;
  }

  //   private updateBoard() {
  //     document.dispatchEvent(this.event);

  //     document.addEventListener("updating-board", () => {
  //       console.log("board is updating !!!");
  //     });
  //   }
}
