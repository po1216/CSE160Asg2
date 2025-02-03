## CSE 160 Assignment 2: Blocky Animal

This repository contains the source code of the assignment.

Click the link to access the live hosted submission: https://po1216.github.io/CSE160Asg2/index.html


### Objectives:
Create a blocky animal by transforming 2D geometric shapes and 3D objects using matrices.

### Additional features beyond the basics:
- Animation is added to most of the parts.
- `drawCube()` function is modified to take a color parameter.
- Front legs have third level joints (feet).
- You can rotate the animal by clicking and dragging on the canvas.
- As a non-cube primitive,  `Pyramids` class is included. The pyramids are used for the ears and the tail of the dog.
- If you shift+click the dog, he will start wag his tail. Shift+click again to stop the tail.
- On my machine, the page renders the dog at about 3000 fps according to the performance indicator. The performance optimization is done by setting up a buffer to `drawTriangle3D()` function.

### Buttons:
- [Reset angle] button resets the global rotation to 0. This might be useful if you have rotated the dog with the mouse control.
- [Freeze!] button stops all animations.
- [Keep breathing] button lets the dog breathe. He will be breathing already unless you hit [Freeze!] button.
- [Start walking] button makes the dog walk.
- There are buttons to turn animation on and off for each leg.
- [Reset leg position] button resets the positions of all 4 legs to the initial positions.

