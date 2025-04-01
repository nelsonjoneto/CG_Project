# CG 2024/2025

## Group T07G10

## TP 5 Notes

This project explores the creation and use of custom GLSL shaders integrated into a WebGL rendering pipeline, within the context of TP5. All work was developed on top of the provided framework using CGF (Computer Graphics Framework).

The exercises are split into two main components:
- Part 1: Shader effects on the **Teapot** object.
- Part 2: Dynamic water simulation on the **Plane** object.

Each major step is represented by a Git tag (e.g., `tp5-1`) to enable precise version tracking and reproducibility.

## Part 1 – Shaders on the Teapot
### 1.1 Window-Based Coloring (tp5-1)
- We created a pair of shaders (`teapot1.vert`, `teapot1.frag`) that color the **teapot based on fragment position in window coordinates**. The goal was to visually distinguish the top and bottom halves of the screen.

- In the **vertex shader**, we pass `gl_Position` to the fragment shader using a `varying` variable named `vert`.
- In the **fragment shader**, we inspect the normalized Y value of `vert` (`y / w`) to determine color:
  - **Yellow (1,1,0)** if `y > 0.5`
  - **Blue (0,0,1)** otherwise

The effect is dynamic and viewport-dependent: resizing the canvas alters the color split.

📄 Files:
- `shaders/teapot1.vert`
- `shaders/teapot1.frag`

📸 *Screenshot:*  
![TP5-1](img/tp5-1.png)

### 1.2 Animated X-Axis Translation

- Building on the previous shader, we added a sinusoidal animation along the X-axis using `timeFactor`. The amplitude of the wave is scaled by a uniform variable `scaleFactor`, controllable through the interface.

- A new uniform `timeFactor` was introduced, animated through `scene.update(t)`.
- The displacement is modulated by `scaleFactor`, a user-controlled parameter in the GUI.
- The expression used is:
  ```glsl
  aVertexPosition.x + normScale * sin(timeFactor)
  ```

- This creates a side-to-side wobbling animation of the teapot.


### 1.3 Grayscale Shader

- We created a new fragment shader to convert a textured model's output into grayscale based on luminance.

- ased on the Sepia shader, we applied the standard luminance formula:

```glsl
L = 0.299 * R + 0.587 * G + 0.114 * B
```

📸 *Screenshot:*  
![TP5-1](img/tp5-2.png)


## Part 2 – Animated Water Shader on a Plane
### 2.1 Water Shader Setup
- We created water.vert and water.frag based on the existing texture shaders, and registered them in the scene. When selecting the Plane object in the GUI and activating the "Water" shader, a base water texture is rendered.

### 2.2 Texture Replacement
- We replaced the textures used in the scene for the "Water" shader:

Base texture: waterTex.jpg

Secondary texture: waterMap.jpg

In this step, the fragment shader multiplies both textures, producing dark reddish patches that simulate surface variation.

### 2.3 Heightmap Displacement
- The vertex shader was updated to use the red channel of waterMap.jpg as a heightmap. Each vertex on the plane is displaced along the Y-axis based on this value, simulating wave peaks and valleys.

### 2.4 Animated Water
- Finally, the water effect was animated by varying the texture coordinates over time in both vertex and fragment shaders using the timeFactor uniform. This gives the illusion of moving water with continuous surface undulation.

```
vec2 displacedTexCoord = aTextureCoord + vec2(sin(timeFactor * 0.1), cos(timeFactor * 0.1)) * 0.05;
```

- This creates a convincing illusion of flowing or rippling water.

- The animation is smooth and continuous due to time updates via update(t) in the scene.

![TP5-1](img/tp5-3.png)