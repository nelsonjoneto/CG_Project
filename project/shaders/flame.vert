attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float timeFactor;
uniform float flameOffset;

// New parameters for unique movement patterns
uniform float xFrequency;
uniform float yFrequency;
uniform float zFrequency;
uniform float moveScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;

// Triangle wave function (linear back-and-forth)
float triangleWave(float t) {
    t = fract(t); // Keep t in 0-1 range
    return t < 0.5 ? t * 2.0 : 2.0 - t * 2.0;
}

void main() {
    // Only animate the top vertex (y > 0)
    vec3 position = aVertexPosition;
    
    if (position.y > 0.1) {
        // Create phase offset per flame
        float phase = fract(timeFactor * 1.0 + flameOffset);
        
        // Define the movement ranges (scale by vertex height and moveScale)
        float xRange = 0.3 * position.y * moveScale;
        float yRange = 0.15 * position.y * moveScale;
        float zRange = 0.2 * position.y * moveScale;
        
        // X movement with unique frequency
        float xOffset = triangleWave(phase * xFrequency) * xRange - (xRange * 0.5);
        
        // Y movement with unique frequency
        float yOffset = triangleWave(phase * yFrequency) * yRange - (yRange * 0.5);
        
        // Z movement with unique frequency
        float zOffset = triangleWave(phase * zFrequency) * zRange - (zRange * 0.5);
        
        // Apply offsets
        position.x += xOffset;
        position.y += yOffset;
        position.z += zOffset;
    }
    
    gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aVertexNormal;
}