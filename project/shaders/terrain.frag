#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec2 vNormalizedCoord; // NEW: receive the normalized coords

uniform sampler2D uSampler;    // Grass texture
uniform sampler2D uSampler2;   // Water texture
uniform sampler2D lakeMask;    // Mask
uniform float timeFactor;

void main() {
    // Sample mask using normalized coordinates
    float mask = texture2D(lakeMask, vNormalizedCoord).r;
    
    if (mask < 0.5) {
        // Water area - animate texture coordinates
        // Use normalized coordinates for water too, but scale for detail
        vec2 animatedCoords = vNormalizedCoord * 20.0 + vec2(timeFactor * 0.003, timeFactor * 0.003);
        vec4 waterColor = texture2D(uSampler2, animatedCoords);
        gl_FragColor = waterColor;
    } else {
        // Grass area - use original texture coordinates (already repeating)
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
}