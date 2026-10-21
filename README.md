# CS1530_Project_Team_Falcons
Chinese Cuisine Knowledge Base

Team name: Team Falcons

Team members:

1.Mingyu Chen

2.Jiakai Dai

3.Haoyang Sun

4.

Project Purpose: Chinese Cuisine Knowledge Base helps college students and young adults who cook at home decide what to make with the ingredients they already have. Users enter their available ingredients, and the system returns Chinese recipes ranked by how well they match, shows which ingredients are missing, and provides step-by-step cooking instructions. Users can also filter recipes by regional cuisine or dietary restriction, save favorites, and comment on recipes, while administrators maintain the accuracy of the recipe database.

We plan to build the system as a responsive web application and an Android/iOS mobile app using React Native with Expo, so that both clients can share most of the same code. Both clients will communicate with a shared backend API built with Node.js and Express, and recipe data will be stored in a PostgreSQL database with UTF-8 encoding to support Chinese and English content. One thing we are unsure about is how to reliably match ingredient names entered in Chinese and in English, including synonyms and regional naming differences, to the same ingredient in our database.
