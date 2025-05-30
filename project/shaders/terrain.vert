attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float timeFactor;
uniform float textureRepeat;
uniform sampler2D lakeMask;

varying vec2 vTextureCoord;
varying vec2 vNormalizedCoord;

void main() {
    vTextureCoord = aTextureCoord;

    // Normalize texture coordinates for the lake mask
    vNormalizedCoord = aTextureCoord / textureRepeat;

    // Sample lake mask to determine where the wave effect applies
    float mask = texture2D(lakeMask, vNormalizedCoord).r;

    vec3 offset = vec3(0.0);
    if (mask < 0.5) {
        // Create a continuous, non-repeating wave effect using sin()
        float wave = sin((aTextureCoord.t + timeFactor * 0.01) * 20.0);
        offset = aVertexNormal * 1.0 * wave;
    }

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
}
