# Flappy Box

## Description of the Project ##
* Flappy Box is quite similar to the popular mobile game Flappy Bird. The game will be a side-scroller where the player controls a 'fun box', attempting to jump between rows of pipes without coming into contact with them. If the player touches the pipes, it ends the game. Basic shapes, translation, rotation and scaling have been used in the program to emulate the same experience as to when the user plays Flappy Bird. 

## Design of the System ##
* The game has been designed and developed in Javascript and WebGL using translation, rotation and scaling. The box is of the boxes done in class, with a little bit of scaling to make it smaller. The program checks for collisions in the Y axis, between pipes and the box. Every time that a pipe gets passed correctly one point is awarded, and if a collision is detected then the program ends. After the game is over, the system will check if the score is a new highscore and if it is, the new high score will be saved. Lastly, the user has the ability to restart the game by pressing the ‘R’ letter.

## Implementation Tools ##
* WebGL
* Javascript
* HTML

## Special Features ##
* Collision when the box touches any of the pipes which means that the game is over.
* Every time the bunny passes a pipe one point will be added to the score.
* To make the box go up the spacebar must be pressed.
* A sound will be made every time the player gets a point, when the box goes up and when a collision occurs, indicating a game over.
* The position between pipes where the box needs to go through is generated randomly.
* The system will track highscores in every session.
* To restart the game, the ‘R’ letter must be pressed.

## Lessons Learned ##
* It was a really fun project where I was able to learn how to make a practical application with the concepts shown and taught in class.
* How simple things like translation and scaling can be used to create extremely successful applications.
* I got more understanding of the underlying concepts of graphic engines, which is great.
* Handling collisions and movement is a lot more complicated when you don’t have objects or can use powerful design tools.
* How powerful can control variables be to make sure your program works successfully and smoothly.

## Possible Future Work ##
* Better models can be used to make the program look better. 
* The ability to make the box go down faster.
* Work on performance, i.e.removing the init buffers inside the render function.
* Add textures
* Create a module for tournaments, or to keep track of highscores over the web.
* Implement this in a 3D environment
* And many other things, the possibilities are endless.

## Video Demo ##
* A demo of the program can be found at: https://youtu.be/IGOZ2nNt3jE

## Conclusion ##
In conclusion, I felt like I’ve learned so many new things with this class and I am extremely grateful for it. It was extremely challenging throughout the semester, and the struggle was real, but definitely worth it as I have expanded my knowledge and my skill set. I am looking forward to my other achievements in computer graphics.
