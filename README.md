CG_project_Chess_board
======================

3D webgl chess board with pieces, made by Mark Ganusevich

Demo: http://mark92.github.io/CG_project_Chess_board/

Models made with: Blender, exported to .obj and converted
with convert_obj_three.py; 
3D library used: Three.js; 
Inspired by awesome tutorials at: http://code.tutsplus.com/search?search%5Bkeywords%5D=webgl



* Setting up the renderer and the camera:
Straightforward initialization of the default renderer with
antialiasing( needs video card to work ), turning on the shadow map to
enable shadows. Camera is also nothing special - simple perspective camera.

* Setting up the lights:
There are two lights, a main one and a filler one, positioned on different
sides of the board. The main light casts shadows on object and as such has
increased shadow fidelity than the default. There's also a skybox to provide
background lighting, which is a generic cube with only inside rendering. The
board is set to receive shadows, and the pieces only to cast.

* Setting up the board:
Now this is more interesting, the board is procedurally generated, using the
beginning of coordinates as an origin point. First we generate the squares by
going through a double loop, the color of the square depends on the count
being even or odd. After that we add a big flat cube, just a little bit lower
than the Y of squares.

* Setting up the chess pieces:
We have a $pieces structure, which holds information on what types of pieces
there are, how many and what are their positions. We also have
$pieces.color.materials for default material of the color, and
$pieces.color.direction to define how the pieces should be rotated.

  First, we go through every pieces type we need( implemented with white, but
black is also okay) and queue their loading. When loading finishes, they are
passed to a piece creation function which creates a mesh from the data and
set's it's position/scale/rotation depending on its color and type. If the
type is 'tower', it is cloned into $tower variable for future use, since we
use the tower model to demonstrate face materials. Note: if you initialize
geometry without making a backup of it( i.e. cloning ), you may come up with
dificulties trying to modify it after( particulary with face materials ).

* Animating the picture:
The rendering works how you would expect, notable thing is the camera rotation.
To rotate the camera around the origin point, we use the well known circle eq-
uation x^2 + y^2 = r^2. To run through the x and z parameters, we are using Cos
and Sin, since otherwise you would be making half a rotation back and forth.

* Swapping the materials:
Before making changes to materials, we reset some of the parameters:
$materials array for face material, we recreate the $tower pieces in
case they were modified with face materials, we reinitialise the board for the
same reason, we also reset all materials to basic.

  After that we create temporary materials, and just loop through all our
objects changing them, really nothing fascinating.

  If we choose to change the face materials, in case of the board, we just
generate an array of basics and recreate a new board base with the new array,
since you can't really modify the material to be a face material after
creating a mesh. In the case of tower pieces, we do the same, but first we
edit the materialIndex of it's geometery's face's to represent the different
materials. 

* Interaction
After a mouse click, the camera shoots a laser of death through the cursor.
If the laser hits a chess piece - movement starts, if not, we assume you
wanted to move the camera, so camera movement starts.

* Piece movement
If we are moving a piece, another laser shoots every time we move the mouse.
The lasers checks for collisions with the board squares, if a square is hit
it is assumed as a desirable movement location. Also a lot of conditioning
happens about available moves etc. When the piece is released it just relo-
cates and some cleaning stuff happens.

* Camera movement
Camera movement uses the spehere parametrical equation, there isn't much to it.
