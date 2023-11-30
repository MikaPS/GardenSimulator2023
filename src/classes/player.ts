import { Point } from "./gameWorld.ts";

export class Player {
  point: Point;
  id: number;

  constructor(spawnPosition: Point = { x: 0, y: 0 }, id: number) {
    this.point = spawnPosition;
    this.id = id;
  }

  move(xMove: number, yMove: number) {
    const requestedX = this.point.x + xMove;
    const requestedY = this.point.y + yMove;

    if (-1 < requestedX && requestedX < 12) {
      this.point.x += xMove;
    }
    if (-1 < requestedY && requestedY < 10) {
      this.point.y += yMove;
    }
  }
}
