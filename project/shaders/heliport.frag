#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uBaseTexture;    // H texture
uniform sampler2D uManeuverTexture; // UP or DOWN texture
uniform float timeFactor;
uniform int isAnimating;           // 0 = static, 1 = blinking

void main() {
    // Sample both textures
    vec4 baseColor = texture2D(uBaseTexture, vTextureCoord);
    vec4 maneuverColor = texture2D(uManeuverTexture, vTextureCoord);
    
    // If not animating, just show base texture
    if (isAnimating == 0) {
        gl_FragColor = baseColor;
        return;
    }
    
    // Create blinking effect with sine wave
    // Use floor to create a sharp on/off transition
    float blinkFactor = floor(sin(timeFactor * 10.0) + 0.5);
    
    // Mix between base and maneuver texture based on blink factor
    gl_FragColor = mix(baseColor, maneuverColor, blinkFactor);
}