# GardenSimulator2023

### Previous devlogs entries:

- 11/17/2023 - introducing the team: https://github.com/MikaPS/GardenSimulator2023/tree/969395d396bd3d06578792227bb6261b358070af
- 11/21/2023 - f0: https://github.com/MikaPS/GardenSimulator2023/tree/4fc46044b69290cb4b10f7714747767303cfa75b

### Devlog Entry - 11/29/2023

## How we satisfied the software requirements

F1 Requirements:

- **[F1.a] The important state of each cell of your game’s grid must be backed by a single contiguous byte array in AoS or SoA format. Your team must statically allocate memory usage for the whole grid.**
  We create a DataMap class that holds a single contiguous byte array that we use to allocate memory for the entire grid. Using dataview, we created a wrapper around the byte array so we could use regular functions on it (set, get, forEach, etc). Each location on the grid correlates to a buffer location which we get using this function: getBufferLocation(). We set the dataview at this buffer location to either 0 if we don't have a plant or to an array buffer that represents the plant. After going through all grid locations, we add the player to the byte array (save its location and ID in case we have multiple players). We have an AoS structure for the byte array where we save the information of each plant based on their position on the grid, so we have the full information of one location on the grid and then we save the information of the next cell.

![F1.a data structure diagram](./arraybuffer.png)

- **[F1.b] The player must be able to undo every major choice (all the way back to the start of play), even from a saved game. They should be able to redo (undo of undo operations) multiple times.**
  We have undo and redo buttons that are available to the players. In the Play.ts file, we have two arrays that save each change that happens to the game. By keeping track of the player's previous actions, we allow them to undo every major choice in the game.

- **[F1.c] The player must be able to manually save their progress in the game in a way that allows them to load that save and continue play another day. The player must be able to manage multiple save files (allowing save scumming).**
  We created 3 save files for the players. Using buttons on screen, they can save or load three different states of the game. We implemented that by stringifying three array buffers, each representaing a different save file, and keeping them in local storage. The players can relax knowing that their progress is saved and they can manage it based on their needs.

- **[F1.d] The game must implement an implicit auto-save system to support recovery from unexpected quits. (For example, when the game is launched, if an auto-save entry is present, the game might ask the player "do you want to continue where you left off?" The auto-save entry might or might not be visible among the list of manual save entries available for the player to load as part of F1.c.)**<br>
  Upon closing a window, the game saves itself into one of the three save files. If the player last interacted with something in save file 1, we would automatically save the changes into that file. If the player opened the game for the first time, we use a default save file. Not only that, but upon opening the window, that last progress is restored and displayed on the screen.

F0 requirements are the same as last week:

- **[F0.a] You control a character moving on a 2D grid** <br>
  We have a set of keys on the bottom of the screen, each arrow corresponds to a direction that you can move your character. We do by having a player class with a position field and a method that moves the player based on a given direction. This satisfies the requirements because the character can move in two dimensions, left or right, and up and down.

- **[F0.b] You advance time in the turn-based simulation manually.** Every move you make advances the world time. You can also click on the clock to advance time without having to make an action. This satisfies turn-based time simulation because the player can manually decide whether or not they want to progress the global time. Advancing the time affects the game state.

- **[F0.c] You can reap (gather) or sow (plant) plants on the grid when your character is near them.**
  By clicking the tractor icon while standing on top of a fully grown plant, the player harvests it, and it goes into the inventory on the right side of the screen. If the player is standing on top of a cell that has no plant inside of it, they can click a plant icon at the bottom of the screen to plant that kind of plant. We currently have 3 different types of plants that the player can choose from. This satisfies the requirements because players have the ability to both reap and sow plants.

- **[F0.d] Grid cells have sun and water levels. The incoming sun and water for each cell is somehow randomly generated - each turn. Sun energy cannot be stored in a cell (it is used immediately or lost) while water moisture can be slowly accumulated over several turns.**
  Each turn the sun is randomized and the global water is increased by 0-5 points. Every plant that is on screen uses 1 water to grow. If the player gets lucky and has enough sun and water energy, plants can level up. This satisfies the requirements because the sun energy is not stored in any tile and is randomly generated every turn. If the player has too many plants then they will deplete the water supply. So the Water slowly accumulates over every turn if the player does not have many plants, which ensures the players think about their actions before playing.

- **[F0.e] Each plant on the grid has a type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”).**
  We have three plant types: apple tree, lily, and sunflower. Players can sow all three of these plants using the associated buttons on the screen. Each plant has a growth level shown by how much of the emoji is visible. Only when a plant is fully grown, it can be picked. Currently, there are 15 different "levels" of plant which corresponds to how much of the emoji is shown. This satisfies the requirement as there is visual indication of how much a plant is grown and each plant has numerous stages (1-15).

- **[F0.f] Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions).**
  If a plant has 2 or more plants within a cross around it, the plant is unable to grow at all. This satisfies the requirements because a plant will grow a set amount based on 3 conditions. The amount of water in the soil (which is affected by the total number of plants). The sun value (which is randomly generated every turn) and the number of nearby plants (if there are two or more plants nearby, then a plant is unable to grow)

- **[F0.g] A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).** <br>
  When the player harvests 6 or more plants, the game is won and a helpful message appears. This satisfies the requirements as the scenario is effectively completed after 6 plants have been gathered.

## Reflection

**Looking back on how you achieved the new F1 requirements, how has your team’s plan changed? Did you reconsider any of the choices you previously described for Tools and Materials or your Roles? Has your game design evolved now that you've started to think about giving the player more feedback? It would be very suspicious if you didn’t need to change anything. There’s learning value in you documenting how your team’s thinking has changed over time.
**

We decided that it would be easier to save plants as byte arrays rather than a simple class. This way, we could easily implement an ArrayBuffer for the entire grid and maniuplate the values of the plants. We completley changed the way we look at "plants" in the game. We like the tools we previously described; we had previous experience using local storage in TypeScript, which helped us finish the tasks a bit quicker. However, we realized we need to provide more feedback to the player, since each plant grows in a different speed dependning on the day, it can get a bit confusing. We are still trying to come up with the best solution for that, but it would change the way we designed our UI.
