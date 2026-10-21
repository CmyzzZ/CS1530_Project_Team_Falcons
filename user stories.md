E1: Recipe Discovery and Matching
Home cooks can search and find Chinese dishes using ingredients they have, see missing items, and filter by cuisine.

US1: Input available ingredients 
As a cook, I want to type or pick ingredients I have at home so that the app knows what I can use. 
FR: FR1    Priority: Must    MVP: yes
[ ] The user can type ingredient names in English or Chinese into a search box.
[ ] The user can pick ingredients from a simple list of common Chinese ingredients.
[ ] Picked ingredients show up on the screen as small tags that can be removed.
[ ] The user can remove any ingredient tag by clicking or tapping on it.

US2: Search dishes by ingredient match 
When cooking, I want to see dishes sorted by how well they match what i have on hand, so i can decide which too cook. 
FR: FR2    Priority: Must    MVP: yes
[ ] The app shows full match dishes on top and partial match dishes below them.
[ ] Every returned dish contains at least one of the ingredients entered by the user.
[ ] Each dish card shows the name in the user's preference language and shows how many ingredients matched.
[ ] The search results show up on the screen in less than 1.5 seconds.

US3: Identify missing recipe ingredients 
As a cook, I want to see which ingredients are missing for a dish so that I know what else I need to buy. 
FR: FR3    Priority: Should    MVP: yes
[ ] Missing ingredients are clearly marked with a red tag.
[ ] The dish card shows the exact number and names of missing ingredients.
[ ] Dishes with zero missing items say all ingredients are ready.

US4: Filter recipes by cuisine style and diet 
As a cook, I want to filter dishes by Chinese region and diet rules so that I find food that fits me. FR: FR4    Priority: Should    MVP: no
[ ] The user can pick regional styles like Sichuan or Cantonese.
[ ] The user can pick diet choices like Vegetarian or Nut-Free.
[ ] The list of dishes updates right away after a filter is selected.
[ ] The user can simply click one button to clear all filters.

E2: Cooking Instruction and Personalization 
Users can read cooking steps, estimate time to prepare, save favorite dishes, and leave comments.

US5: View step-by-step cooking instructions 
When preparing food, I want to see simple cooking steps, prep time, and seasonings so that I can cook the dish easily. 
FR: FR5    Priority: Must    MVP: yes
[ ] The recipe page shows the total prep time,  and all needed seasonings.
[ ] The cooking steps are numbered from first to last and are easy to read.
[ ] All words show up correctly in the user's preferred language.

US6: Save recipes to favorites 
As a cook, I want to save dishes to my favorites list so that I can find them fast next time. 
FR: FR7    Priority: Should    MVP: yes
[ ] The user can click a star button on any recipe card or page to save it.
[ ] The button changes color so the user knows the dish was saved.
[ ] The user can open a favorites page to see all saved dishes.
[ ] The user can remove a dish from the favorites list with one click.

US7: Post comments on recipes 
As a cook, I want to leave comments on recipes so that I can share whether the recipe is good or bad with other people.
FR: FR11    Priority: Could    MVP: no
[ ] The user can type and post a short text comment under a recipe.
[ ] Empty comments cannot be posted.
[ ] New comments show up on the recipe page with the time they were posted.

E3: Recipe Management
Admins can add new recipes, fix wrong steps, and manage ingredient tags in the database.

US8: Create a new recipe entry 
As an admin, I want to add a new Chinese dish with its ingredients. 
FR: FR9    Priority: Must    MVP: yes
[ ] The admin form has inputs for dish name in English and Chinese, prep time, ingredients, seasonings, and steps.
[ ] The form cannot be saved if important inputs like dish name or steps are left blank.
[ ] When saved, the new dish goes into the database and can be searched right away.

US9: Add custom ingredients and cuisine tags 
As an admin, I want to add new ingredients and region tags so that dishes are tagged correctly. FR:    FR9 Priority: Should    MVP: yes
[ ] The admin can type in a new ingredient name in both English and Chinese.
[ ] The admin can add a new region tag.
[ ] Newly created ingredients and tags show up as options when making a recipe.

US10: Edit existing recipe instructions and quantities
As an admin, I want to fix wrong steps or ingredient amounts so that cooks get the right steps. FR: FR10    Priority: Should    MVP: no
[ ] The admin can pick an existing recipe to edit.
[ ] Loads current data correctly.
[ ] Updates the recipe details right away.
[ ] The screen shows a message confirming that the changes were saved.

US11: Suggest ingredient substitutions 
As a cook, I want to see substitute ingredients if some Chinese ingredient is hard to find so that I can buy things at local US stores. 
FR:    FR6 Priority:    Could MVP: no
[ ] Hard-to-find ingredients have a substitute note next to them.
[ ] Clicking the note shows simple items to buy instead from local stores.
[ ] If no replacement works, the app says the ingredient is required.
