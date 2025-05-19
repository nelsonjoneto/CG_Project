// Vertex Shader: flame.vert

precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uTime;
uniform float uOffset;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main() {
    vec3 pos = aVertexPosition;

    // Flame wave: sine-based deformation, modulated by height (y)
    float wave = sin(uTime * 4.0 + pos.y * 10.0 + uOffset) * 0.2;

    // Curve horizontally (X axis only, you can tweak to Z or both)
    pos.x += wave;

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);

    vTextureCoord = aTextureCoord;
    vNormal = aVertexNormal;
}
