import * as Phaser from "phaser";
//import * as yaml from "js-yaml";

export class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    // Don't show any game menu here.
    // Just immediately transition to the play scene.
    this.scene.start("play");
  }
}

// export default class PreloaderScene extends Phaser.Scene {
//   private yamlFile!: Phaser.Loader.FileTypes.TextFile;

//   constructor() {
//     super("preloaderScene");
//   }

//   preload() {
//     // Load the YAML file
//     console.log("Menu preload");
//     this.load.text("yamlData", "/assets/scenario.yaml")!;
//   }

//   create() {
//     console.log(this.yamlFile);
//     // Extract the YAML data

//     console.log("Extract Yaml Data");
//     //const yamlData = this.cache.text.get("yamlData");
//     //const data: Record<string, any> = yaml.load(yamlData)!;
//     this.scene.start("play");
//   }
// }
