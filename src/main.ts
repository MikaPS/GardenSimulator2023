import * as Phaser from "phaser";
// import Menu from "./scenes/Menu";
// import PreloaderScene from "./scenes/Menu";
import { Play } from "./scenes/Play";
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.ts")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}
const config: Phaser.Types.Core.GameConfig = {
  width: 640,
  height: 480,
  scene: [Play],
  backgroundColor: "#6b8e23",
};

const languageHolder = document.createElement("div");
languageHolder.id = "languageHolder";
document.body.appendChild(languageHolder);

interface Language {
  name: string;
  text: string;
}

export function createLanguageButtons() {
  const languages: Language[] = [
    { name: "English", text: "English" },
    { name: "Hebrew", text: "עברית" },
    { name: "Chinese", text: "中文" },
  ];

  languages.forEach((language) => {
    const button = document.createElement("button");
    button.innerHTML = language.text;
    // console.log("ID set to :", language.name);
    button.id = language.name;
    languageHolder.appendChild(button);
  });
  return languages;
}

new Phaser.Game(config);

document.title = "Garden Simulator 2023";
document.body.style.backgroundColor = "#6F4E37";

document.body.appendChild(document.createElement("br"));

const buttonHolder = document.createElement("div");
buttonHolder.id = "ButtonHolder";
// buttonHolder.style.display = "flex";
// buttonHolder.style.flexDirection = "column";
// buttonHolder.style.alignItems = "flex-end";
document.body.appendChild(buttonHolder);

export function createMovementButtons() {
  const buttons = [
    "⬅️",
    "⬆️",
    "⬇️",
    "➡️",
    "↩️",
    "↪️",
    "🗄️1",
    "🗄️2",
    "🗄️3",
    "🗃️1",
    "🗃️2",
    "🗃️3",
  ];
  buttons.forEach((direction) => {
    const button = document.createElement("button");
    button.innerHTML = direction;
    button.id = direction + "Button";
    buttonHolder.appendChild(button);
  });
}
