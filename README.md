# Flappy Box

## Description of the Project ##
* Flappy Box will be something similar to the popular mobile game Flappy Bird. The game will be a side-scroller where the player controls a 'fun box', attempting to jump between rows of pipes without coming into contact with them. If the player touches the pipes, it ends the game. It will be developed in WebGL.

## Design of the System ##
* The game will be designed and developed in WebGL/JS using translation, rotation and scalability. The box will be created with what we have learned from class. The
program will check for collisions between pipes and the box. Every time that a pipe gets passed correctly one point will be awarded, and if a collision is detected then the program will end. After the game is over, the system will check if the score is a new highscore and if it is, then that would be considered the new highscore. There will also be sounds when a collision happens and every time the box 'flies' upwards.

## Implementation Tools ##
* WebGL
* Javascript
* HTML

## Special Features ##
* Collision when the box touches any of the pipes which means that the game is over.
* Every time the box passes a pipe one point will be added to the score.
* A sound will be made every time the player gets a point, every time the users flaps, and when there's a collision.
* The space between pipes will be random.
* The system will track highscores.
