self.addEventListener("install", () => {
  console.log("sw install");
});

self.addEventListener("activate", () => {
  console.log("sw activate");
});
