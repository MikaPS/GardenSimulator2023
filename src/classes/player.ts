import { Point } from "./gameWorld.ts";

export class Player {
  point: Point;
  id: number;

  constructor(spawnPosition: Point = { x: 0, y: 0 }, id: number) {
    this.point = spawnPosition;
    this.id = id;
  }

  move(xMove: number, yMove: number) {
    if (this.point.x < 19 || xMove === -1) {
      this.point.x += xMove;
    }
    this.point.y += yMove;
  }
}
