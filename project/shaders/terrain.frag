#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec2 vNormalizedCoord;

uniform sampler2D uSampler;    // Grass texture
uniform sampler2D uSampler2;   // Water texture
uniform sampler2D lakeMask;    // Mask
uniform float timeFactor;

void main() {
    // Sample mask to determine if current fragment is water or grass
    float mask = texture2D(lakeMask, vNormalizedCoord).r;
    
    if (mask < 0.5) {
        // Water area - apply animated texture coordinates for flowing effect
        // Scale coordinates for detail and offset based on time
        vec2 animatedCoords = vNormalizedCoord * 20.0 + vec2(timeFactor * 0.003, timeFactor * 0.003);
        vec4 waterColor = texture2D(uSampler2, animatedCoords);
        gl_FragColor = waterColor;
    } else {
        // Grass area - use original texture coordinates with repeating pattern
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
}