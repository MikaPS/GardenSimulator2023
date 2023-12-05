import * as Phaser from "phaser";
// import Menu from "./scenes/Menu";
// import PreloaderScene from "./scenes/Menu";
import { Play } from "./scenes/Play";

const config: Phaser.Types.Core.GameConfig = {
  width: 640,
  height: 480,
  scene: [Play],
  backgroundColor: "#6b8e23",
};

new Phaser.Game(config);

document.title = "Garden Simulator 2023";
document.body.style.backgroundColor = "#6F4E37";

document.body.appendChild(document.createElement("br"));

const buttonHolder = document.createElement("div");
buttonHolder.id = "ButtonHolder";
document.body.appendChild(buttonHolder);

export function createMovementButtons() {
  const buttons = [
    "⬅️",
    "⬆️",
    "⬇️",
    "➡️",
    "undo",
    "redo",
    "savefile1",
    "savefile2",
    "savefile3",
    "loadfile1",
    "loadfile2",
    "loadfile3",
  ];
  buttons.forEach((direction) => {
    const button = document.createElement("button");
    button.innerHTML = direction;
    button.id = direction + "Button";
    buttonHolder.appendChild(button);
  });
}
