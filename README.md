# GardenSimulator2023

### Previous devlogs entries:
- 11/17/2023 - introducing the team: https://github.com/MikaPS/GardenSimulator2023/tree/969395d396bd3d06578792227bb6261b358070af
- 11/21/2023 - f0: https://github.com/MikaPS/GardenSimulator2023/tree/4fc46044b69290cb4b10f7714747767303cfa75b

### Devlog Entry - 11/20/2023

## How we satisfied the software requirements

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

-**[F0.g] A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above).** <><br>
When the player harvests 6 or more plants, the game is won and a helpful message appears. This satisfies the requirements as the scenario is effectively completed after 6 plants have been gathered.

## Reflection

**Looking back on how you achieved the F0 requirements, how has your team’s plan changed? Did you reconsider any of the choices you previously described for Tools and Materials or your Roles? It would be very suspicious if you didn’t need to change anything. There’s learning value in you documenting how your team’s thinking has changed over time.**

We did not reconsider many choices while completing the F0 requirements. We think that this is because we were careful not to be overly ambitious to ensure that we would be able to complete the assignment on time. One change we did have was changing how we interpreted the plants' levels. We originally wanted plants to have distinct levels with different emojis, however, we discovered a feature that cut off part of the emoji and we felt like it perfectly portrayed the growth of a plant since more and more of the emoji was revealed as the plant's levels increased.
