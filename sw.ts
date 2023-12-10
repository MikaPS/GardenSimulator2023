self.addEventListener("install", () => {
  console.log("sw install");
});

self.addEventListener("activate", () => {
  console.log("sw activate");
});
self.addEventListener("fetch", () => {
  console.log("thats so fetch");
});
