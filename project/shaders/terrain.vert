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

    // Convert repeating texture coordinates to 0-1 range for mask sampling
    vNormalizedCoord = aTextureCoord / textureRepeat;

    // Sample lake mask to determine where the wave effect applies
    float mask = texture2D(lakeMask, vNormalizedCoord).r;

    vec3 offset = vec3(0.0);
    if (mask < 0.5) {
        // Apply vertical wave displacement only to water areas (mask < 0.5)
        // Wave height varies with sin function for smooth animation
        float wave = sin((aTextureCoord.t + timeFactor * 0.01) * 20.0);
        offset = aVertexNormal * 0.3 * wave;
    }

    // Apply vertex displacement to final position
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
}