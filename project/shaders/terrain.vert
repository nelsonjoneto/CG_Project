attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float timeFactor;
uniform float textureRepeat; 
uniform sampler2D waterMap;
uniform sampler2D lakeMask;

varying vec2 vTextureCoord;
varying vec2 vNormalizedCoord; // NEW: normalized coordinates for mask

void main() {
    vTextureCoord = aTextureCoord;
    
    // Add normalized coordinates (0-1 range) for mask texture
    vNormalizedCoord = vec2(
        aTextureCoord.s / textureRepeat,  
        aTextureCoord.t / textureRepeat
    );

    // Use normalized coordinates for mask
    float mask = texture2D(lakeMask, vNormalizedCoord).r;

    vec3 offset = vec3(0.0);
    if (mask < 0.5) {
        // Sample at two positions for more complex waves
        // Use normalized coordinates for waterMap too
        float wave1 = texture2D(waterMap, vNormalizedCoord + vec2(0.03 * timeFactor, 0.0)).b;
        float wave2 = texture2D(waterMap, vNormalizedCoord + vec2(0.0, 0.02 * timeFactor)).b;
        
        // Combine waves for more natural movement
        offset = aVertexNormal * 0.1 * (wave1 + wave2 - 1.0);
    }

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
}