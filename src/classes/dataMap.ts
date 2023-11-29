import { Plant } from "./plant.ts";
import { Player } from "./player.ts";
import { Point } from "./gameWorld.ts";

export class DataMap implements Iterator<Plant> {
  private gridBuffer: ArrayBuffer;
  private view: DataView;
  private currentIterationIndex = 0;

  public width: number;
  public height: number;
  public size: number = 0;
  public BUFFER_SIZE: number;
  private PLANT_BUFFER_SIZE: number;

  constructor(
    width: number,
    height: number,
    PLANT_BUFFER_SIZE: number,
    PLAYER_BUFFER_SIZE: number,
  ) {
    this.PLANT_BUFFER_SIZE = PLANT_BUFFER_SIZE;
    this.width = width;
    this.height = height;
    this.BUFFER_SIZE = PLANT_BUFFER_SIZE + PLAYER_BUFFER_SIZE;
    this.gridBuffer = new ArrayBuffer(
      this.BUFFER_SIZE * this.width * this.height,
    );
    this.view = new DataView(this.gridBuffer);
    for (let i = 0; i < width * height; i++) {
      this.zeroPlant(i * this.BUFFER_SIZE);
    }
  }

  setSize() {
    let count = 0;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.has(JSON.stringify({ x, y }))) {
          count++;
        }
      }
    }
    this.size = count;
  }

  getBufferLocation(point: Point): number {
    return (point.x + point.y * this.width) * this.BUFFER_SIZE;
  }

  set(key: string, plant: Plant) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);

    const smallPlantArray = new Uint8Array(plant.exportToByteArray());
    // this.view.setUint8(loc, smallPlantArray[0]);
    this.writePlantAt(loc, smallPlantArray);
  }

  // Players only have the location, so we can just write one uint8 to the last location after the plants
  // Each unit8 would represent the location of one of the players
  setPlayer(key: string, id: number) {
    const point: Point = JSON.parse(key);
    const loc = this.PLANT_BUFFER_SIZE + id * 8;
    this.view.setInt32(loc, point.x);
    this.view.setInt32(loc + 4, point.y);
  }

  get(key: string) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);
    const plantData = this.getPlantAt(this.view, loc);
    const newPlant = new Plant();
    newPlant.importFromByteArray(new Uint8Array(plantData).buffer);
    return newPlant;
  }

  getPlayer(id: number) {
    const loc = this.PLANT_BUFFER_SIZE + id * 8;
    const x = this.view.getInt32(loc);
    const y = this.view.getInt32(loc + 4);
    const newPlayer = new Player({ x, y }, id);
    return newPlayer;
  }

  delete(key: string) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);
    this.zeroPlant(loc);
  }

  has(key: string): boolean {
    const point: Point = JSON.parse(key);
    if (
      point.x < 0 ||
      point.y < 0 ||
      point.x > this.width ||
      point.y > this.height
    ) {
      return false;
    }
    const loc = this.getBufferLocation(point);

    //From Plant class Type
    const plantData = this.getPlantAt(this.view, loc);
    const newP = new Plant();

    newP.importFromByteArray(new Uint8Array(plantData).buffer);

    // if (newP.plantType !== undefined) {
    //   const v = new DataView(new Uint8Array(plantData).buffer);
    //   const num = v.getFloat32(16);
    // }

    return newP.plantType !== undefined;
  }

  [Symbol.iterator](): Iterator<Plant> {
    return this;
  }

  next(): IteratorResult<Plant> {
    if (this.currentIterationIndex < this.width * this.height) {
      const plantData = this.getPlantAt(
        this.view,
        this.currentIterationIndex * this.BUFFER_SIZE,
      );
      const newPlant = new Plant();

      newPlant.importFromByteArray(new Uint8Array(plantData).buffer);
      return { value: newPlant, done: false };
    } else {
      this.currentIterationIndex = 0;
      return { value: undefined, done: true };
    }
  }

  forEach(callback: (value: Plant, index: number) => void) {
    this.currentIterationIndex = 0;
    for (const plant of this) {
      if (plant.plantType == undefined) {
        this.currentIterationIndex++;
        continue;
      }
      callback(plant, this.currentIterationIndex++);
    }
  }

  *iteratePlayers(): Generator<Player> {
    let count = 0;
    for (let i = this.PLANT_BUFFER_SIZE; i < this.BUFFER_SIZE; i += 8) {
      yield this.getPlayer(count);
      count += 1;
    }
  }

  deletePlayers() {
    for (let i = this.PLANT_BUFFER_SIZE; i < this.BUFFER_SIZE; i += 8) {
      this.view.setFloat32(i, 0);
      this.view.setFloat32(i + 4, 0);
    }
  }

  private getPlantAt(dataView: DataView, offset: number): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < this.BUFFER_SIZE; i++) {
      bytes.push(dataView.getUint8(offset + i));
    }
    return bytes;
  }

  private writePlantAt(offset: number, array: Uint8Array) {
    for (let i = 0; i < this.BUFFER_SIZE; i++) {
      this.view.setUint8(offset + i, array[i]);
    }
  }

  private zeroPlant(offset: number) {
    for (let i = 0; i < this.BUFFER_SIZE; i++) {
      this.view.setUint8(offset + i, 0);
    }
  }
}
