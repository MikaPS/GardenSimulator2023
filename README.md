# GardenSimulator2023

### Devlog Entry - 11/20/2023

## How we satisfied the software requirements

- **[F0.a] You control a character moving on a 2D grid** <br>
  We have a set of keys on the bottom of the screen, each arrow corresponds to a direction that you can move your character. This satisfies the requirements because the character can move in two dimensions, left or right, and up and down.

- **[F0.b] You advance time in the turn-based simulation manually.** Every move you make advances the world time. You can also click on the clock to advance time without having to make an action. This satisfies turn-based time simulation because the player can manually decide whether or not they want to progress the global time.

- **[F0.c] You can reap (gather) or sow (plant) plants on the grid when your character is near them.**
  By clicking the tractor icon while ontop of a fully grown plant, you harvest it and it goes into your inventory on the right side of the screen. This satisfies the requirements because when a player is ontop of a plant they are near it so they can harvest it. If the player is standing ontop of a cell that has no plant inside of it, they can click a plant icon at the bottom of the screen to plant that kind of plant.

- **[F0.d] Grid cells have sun and water levels. The incoming sun and water for each cell is somehow randomly generated - each turn. Sun energy cannot be stored in a cell (it is used immediately or lost) while water moisture can be slowly accumulated over several turns.**
  Each turn the sun is randomized and the global water is increased by 0-5 points. Every plant that is on screen uses 1 water to grow. This satisfies the requirements because the sun energy is not stored in any tile and is randomly generated every turn. Water is slowly accumulated over every turn if the player does not have many plants. If they player has too many plants then they will deplete the water suppply.

- **[F0.e] Each plant on the grid has a type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”).**
  Each plant has growth level shown by how much of the emoji is visible. Only when a plant is fully grown, can it be picked. Currently, there are 15 different "levels" of plant which corresponds to how much of the emoji is shown. This satisfies the requirement as there is visual indication of how much a plant is grown and each plant has numerous stages (1-15).

- **[F0.f] Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions).**
  If a plant has 2 or more plants within a cross around it, the plant is unable to grow at all. This satisfies the requirements becaues a plant will grow a set amount based on 3 conditions. The amount of water in the soil (which is affected by the total number of plants). The sun value (which is randomly generated every turn). And the amount of nearby plants (If there are two or more plants nearby, then a plant is unable to grow)

-**[F0.g] A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).** <><br>
When the player harvests 6 or more plants, the game is won and helpful message appears. This satisfies the requirements as the scenario is effectively completed completed after 6 plants have been gathered.

## Reflection

**Looking back on how you achieved the F0 requirements, how has your team’s plan changed? Did you reconsider any of the choices you previously described for Tools and Materials or your Roles? It would be very suspicious if you didn’t need to change anything. There’s learning value in you documenting how your team’s thinking has changed over time.**

We did not reconsider many choices while completing the F0 requirements. We think that this is because we were careful to not be overly ambitious to ensure that were able to complete the assignment on time. One change we did have was changing how we interpretted the plants levels. We originally wanted plants to have distinct levels with different emojis, however we discovered a bug that cut off part of the emoji and we felt like it perfectly portrayed the growing of a plant as more and more of the emoji was revealed.
