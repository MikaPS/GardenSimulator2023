import { InternalPlant } from "./plant.ts";
import { Player } from "./player.ts";
import { Point } from "./gameWorld.ts";
import { internalPlantCompiler } from "./plant";
import { allPlantDefinitions } from "../scenarios/plantDefinitions.ts";
import { PLANT_TYPE_POS } from "./plant.ts";

//A custom datastructure made to immitate a Map but with an underlying ArrayBuffer
export class DataMap implements Iterator<InternalPlant> {
  public gridBuffer: ArrayBuffer;
  public view: DataView;
  private currentIterationIndex = 0;

  public width: number;
  public height: number;
  public size: number = 0;
  public SINGLE_PLANT_BUFFER_SIZE: number;
  private PLAYER_BUFFER_START: number;
  private TOTAL_PLAYER_BUFF_SIZE: number;
  private numPlayers: number;
  constructor(
    width: number,
    height: number,
    SINGLE_PLANT_BUFFER_SIZE: number,
    numPlayers: number,
  ) {
    this.SINGLE_PLANT_BUFFER_SIZE = SINGLE_PLANT_BUFFER_SIZE;
    this.width = width;
    this.height = height;
    this.numPlayers = numPlayers;
    //Player buffer begins at the END of the plant buffer in bytes
    this.PLAYER_BUFFER_START =
      this.SINGLE_PLANT_BUFFER_SIZE * this.width * this.height;
    this.TOTAL_PLAYER_BUFF_SIZE = 8 * numPlayers;

    this.gridBuffer = new ArrayBuffer(
      this.SINGLE_PLANT_BUFFER_SIZE * this.width * this.height +
        this.TOTAL_PLAYER_BUFF_SIZE,
    );
    this.view = new DataView(this.gridBuffer);
    for (let i = 0; i < width * height; i++) {
      this.zeroPlant(i * this.SINGLE_PLANT_BUFFER_SIZE);
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

  //Given an X,Y point, get the bugger location of that plant
  getBufferLocation(point: Point): number {
    return (point.x + point.y * this.width) * this.SINGLE_PLANT_BUFFER_SIZE;
  }

  //Set a specific key (x,y) to a plant in the buffer
  set(key: string, plant: InternalPlant) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);

    const smallPlantArray = new Uint8Array(plant.exportToByteArray());
    this.writePlantAt(loc, smallPlantArray);
  }

  // Players only have the location, so we can just write one uint8 to the last location after the plants
  // Each unit8 would represent the location of one of the players
  setPlayer(key: string, id: number) {
    const point: Point = JSON.parse(key);
    const loc = this.PLAYER_BUFFER_START + id * 8;

    this.view.setInt32(loc, point.x);
    this.view.setInt32(loc + 4, point.y);
  }

  //Retrieves a plant with a specific key
  get(key: string) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);
    const plantData = this.getPlantAt(this.view, loc);
    const plantBuffer: ArrayBuffer = new Uint8Array(plantData).buffer;

    const view = new DataView(plantBuffer);
    const id = view.getUint8(PLANT_TYPE_POS);
    const newPlant = internalPlantCompiler(allPlantDefinitions[id]);

    newPlant.importFromByteArray(plantBuffer);
    return newPlant;
  }

  //Gets the ID of a plant stored at a location, skipping creating a plant (useful for grabbing ID to be used for emoji's and names)
  getID(key: string) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);
    const plantData = this.getPlantAt(this.view, loc);
    const plantBuffer: ArrayBuffer = new Uint8Array(plantData).buffer;

    const view = new DataView(plantBuffer);
    const id = view.getUint8(PLANT_TYPE_POS);

    return id;
  }

  //Grabs the player information given the players index
  getPlayer(id: number) {
    const loc = this.PLAYER_BUFFER_START + id * 8;

    const x = this.view.getInt32(loc);
    const y = this.view.getInt32(loc + 4);
    const newPlayer = new Player({ x, y }, id);
    return newPlayer;
  }

  //removes a key writing 0's in the buffer
  delete(key: string) {
    const point: Point = JSON.parse(key);
    const loc = this.getBufferLocation(point);
    this.zeroPlant(loc);
  }

  //Checks if a key exists
  has(key: string): boolean {
    const point: Point = JSON.parse(key);
    //Check if point is out of bounds to avoid reading out of the buffer the memory
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
    const plantBuffer: ArrayBuffer = new Uint8Array(plantData).buffer;

    const view = new DataView(plantBuffer);
    const id = view.getUint8(PLANT_TYPE_POS);
    return id != 0;
  }

  [Symbol.iterator](): Iterator<InternalPlant> {
    return this;
  }

  //Allows forEach to be functional
  next(): IteratorResult<InternalPlant> {
    if (this.currentIterationIndex < this.width * this.height) {
      const plantData = this.getPlantAt(
        this.view,
        this.currentIterationIndex * this.SINGLE_PLANT_BUFFER_SIZE,
      );

      const plantBuffer: ArrayBuffer = new Uint8Array(plantData).buffer;
      const view = new DataView(plantBuffer);
      const id = view.getUint8(PLANT_TYPE_POS);
      const newPlant = internalPlantCompiler(allPlantDefinitions[id]);

      newPlant.importFromByteArray(plantBuffer);

      return { value: newPlant, done: false };
    } else {
      this.currentIterationIndex = 0;
      return { value: undefined, done: true };
    }
  }

  forEach(callback: (value: InternalPlant, index: number) => void) {
    this.currentIterationIndex = 0;
    for (const plant of this) {
      if (plant.plantID == 0) {
        this.currentIterationIndex++;
        continue;
      }
      callback(plant, this.currentIterationIndex++);
    }
  }

  // forEach but only for players
  *iteratePlayers(): Generator<Player> {
    for (let i = 0; i < this.numPlayers; i++) {
      yield this.getPlayer(i);
    }
  }

  deletePlayers() {
    for (let i = 0; i < this.numPlayers; i++) {
      this.view.setFloat32(this.PLAYER_BUFFER_START + i * 8, 0);
      this.view.setFloat32(this.PLAYER_BUFFER_START + i * 8 + 4, 0);
    }
  }

  //Gets an array of bytes for the plant data given an offset
  private getPlantAt(dataView: DataView, offset: number): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < this.SINGLE_PLANT_BUFFER_SIZE; i++) {
      bytes.push(dataView.getUint8(offset + i));
    }
    return bytes;
  }

  //Writes plant data at a given offset
  private writePlantAt(offset: number, array: Uint8Array) {
    for (let i = 0; i < this.SINGLE_PLANT_BUFFER_SIZE; i++) {
      this.view.setUint8(offset + i, array[i]);
    }
  }

  //Writes 0's at a plant offset effectively deleting it
  private zeroPlant(offset: number) {
    for (let i = 0; i < this.SINGLE_PLANT_BUFFER_SIZE; i++) {
      this.view.setUint8(offset + i, 0);
    }
  }
}
