import { Plant } from "./plant.ts";
import { Point } from "./gameWorld.ts";

export class DataMap implements Iterator<Plant> {
  private gridBuffer: ArrayBuffer;
  private view: DataView;
  private currentIterationIndex = 0;

  public width: number;
  public height: number;
  //   public size: number;

  public BUFFER_SIZE: number;

  constructor(width: number, height: number, BUFFER_SIZE: number) {
    this.width = width;
    this.height = height;
    this.BUFFER_SIZE = BUFFER_SIZE;
    this.gridBuffer = new ArrayBuffer(
      this.BUFFER_SIZE * this.width * this.height,
    );
    this.view = new DataView(this.gridBuffer);
    for (let i = 0; i < width * height; i++) {
      this.zeroPlant(i * this.BUFFER_SIZE);
    }
  }

  set(key: string, plant: Plant) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);

    const smallPlantArray = new Uint8Array(plant.exportToByteArray());
    // this.view.setUint8(loc, smallPlantArray[0]);
    this.writePlantAt(loc, smallPlantArray);
  }

  size() {
    let count = 0;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.has(JSON.stringify({ x, y }))) {
          count++;
        }
      }
    }
    return count;
  }

  getBufferLocation(point: Point): number {
    return (point.x + point.y * this.width) * this.BUFFER_SIZE;
  }

  get(key: string) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);
    const plantData = this.getPlantAt(this.view, loc);

    const newPlant = new Plant();
    newPlant.importFromByteArray(new Uint8Array(plantData).buffer);
    return newPlant;
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
