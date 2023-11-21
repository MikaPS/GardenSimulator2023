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
  private winAmount = 5;

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
    if (plantToHarvest.isReady()) {
      this.playerInventory.push(plantToHarvest);
      plantToHarvest.placeInventory(this.playerInventory.length);
      this.plantLayer.delete(key);
    }
    //Send boardChanged event;
  }

  changeTime() {
    this.time += 1;
    const currentSun = Math.floor(Math.random() * 3);
    this.plantLayer.forEach((plant: Plant) => {
      plant.levelUp(currentSun, this.waterMod, this.checkPlantsNearby(plant.point));
    });
    this.waterMod = Math.floor(Math.random() * 5) - this.plantLayer.size;
    if (this.waterMod <= 0) {
      this.waterMod = 1;
    }
    
    console.log(this.haveWon());
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
    //Max is 15?
    const max = 14;
    return max - max * plant.getGrowPercentage();
  }
  
  haveWon(){
    return (this.playerInventory.length > this.winAmount)
  }

  //   private updateBoard() {
  //     document.dispatchEvent(this.event);

  //     document.addEventListener("updating-board", () => {
  //       console.log("board is updating !!!");
  //     });
  //   }
  
}
