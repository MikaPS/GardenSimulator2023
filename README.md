# GardenSimulator2023

## Devlog Entry - 11/19/2023

### **Introducing the team**

Mika - Engine Lead<br>
Zane - Idea Design Lead<br>
Lynelle - Code Design Lead<br>
Wyatt - Tools Lead<br>

**Tools Lead:** This person will research alternative tools, identify good ones, and help every other team member set them up on their own machine in the best configuration for your project. This person might also establish your team’s coding style guidelines and help peers setup auto-formatting systems. This person should provide support for systems like source control and automated deployment (if appropriate to your team’s approach).

**Engine Lead:** This person will research alternative engines, get buy-in from teammates on the choice, and teach peers how to use it if it is new to them. This might involve making small code examples outside of the main game project to teach others. The Engine Lead should also establish standards for which kinds of code should be organized into which folders of the project. They should try to propose software designs that insulate the rest of the team from many details of the underlying engine.

**Idea Design Lead:** This person will be responsible for setting the creative direction of the project, and establishing the look and feel of the game. They might make small art or code samples for others to help them contribute and maintain game content. Where the project might involve a domain-specific language, the Design Lead (who is still an engineer in this class) will lead the discussion as to what primitive elements the language needs to provide.

**Code Design Lead:** This person will be responsible for identifying code smells and proposing better ways to approach code (refactoring). They will help with the development and maintenance of the coding style guidance, ensuring consistency and and coherence for a smooth operation. The Code Design Lead will be pivotal in fostering a clean, efficient, and collaborative coding practices within the team.

### **Tools and materials**

We are using the Phaser library because of the Tweens function, which allows us to animate objects with ease.
We will use the TypeScript language since that's the main focus of this CMPM 121, and we all feel comfortable using it. We are planning to have a data-driven design game, so JSON could be helpful for that, but we are still hashing out the details.

For the IDE, we are using VSCode with the following extensions: ESLint, Live Share, Prettier, and TypeScript Importer. This would allow us to keep a similar coding style and the allow us to together at the same time. For now, we are planning to do a text-based game where we will use letters to indicate cells (for example, 0 could be an empty cell, x is the player, etc.), which doesn't require any imaging tools.

### **Outlook**

**What is your team hoping to accomplish that other teams might not attempt?**<br>
We are thinking of attempting to use Glitch to allow multiple players to connect to the same shared game world. We hope that this should be a reasonable goal if we set up our code in a way that can support it from the beginning. We think that other teams may not attempt this because it requires you to think about how you create game and its classes in a way where you can support multiple players at the same time.

**What do you anticipate being the hardest or riskiest part of the project?**<br>
We are anticipating that the most challenging part of the project will be creating the base for the project in a way that allows it to be adjusted and scaled easily as more requirements arise in combination with thinking about multiplayer support with Glitch. We think that this will also be the riskiest part of the project as it will require us to initially create our project in a way that allows some of the code to run on a server.

**What are you hoping to learn by approaching the project with the tools and materials you selected above?**<br>
We are hoping to learn how to create flexible code that can easily be modified and expanded in addition to creating an experience that supports multiple players playing simultaneously. We also want to learn how to maintain coding guidance throughout the entire project, and keep deadlines without writing "smelly code".
