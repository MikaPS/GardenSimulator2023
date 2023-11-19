import * as Phaser from "phaser";
import Menu from "./scenes/Menu";
import Play from "./scenes/Play";

const config: Phaser.Types.Core.GameConfig = {
  width: 640,
  height: 480,
  scene: [Menu, Play],
  backgroundColor: "#6b8e23",
};

document.title = "Garden Simulator 2023";
document.body.style.backgroundColor = "OliveDrab";

new Phaser.Game(config);
