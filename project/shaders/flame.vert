attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float timeFactor;
uniform float flameOffset;

// Parameters for customizing flame movement patterns
uniform float xFrequency;
uniform float yFrequency;
uniform float zFrequency;
uniform float moveScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;

// Creates linear back-and-forth motion between 0-1
float triangleWave(float t) {
    t = fract(t); // Keep t in 0-1 range
    return t < 0.5 ? t * 2.0 : 2.0 - t * 2.0;
}

void main() {
    // Only animate vertices near the top of the flame
    vec3 position = aVertexPosition;
    
    if (position.y > 0.1) {
        // Create unique phase offset for each flame instance
        float phase = fract(timeFactor * 1.0 + flameOffset);
        
        // Animation ranges increase with vertex height for realistic flame shape
        float xRange = 0.3 * position.y * moveScale;
        float yRange = 0.15 * position.y * moveScale;
        float zRange = 0.2 * position.y * moveScale;
        
        // Calculate movements with different frequencies for organic motion
        float xOffset = triangleWave(phase * xFrequency) * xRange - (xRange * 0.5);
        float yOffset = triangleWave(phase * yFrequency) * yRange - (yRange * 0.5);
        float zOffset = triangleWave(phase * zFrequency) * zRange - (zRange * 0.5);
        
        // Apply calculated offsets to create flickering effect
        position.x += xOffset;
        position.y += yOffset;
        position.z += zOffset;
    }
    
    gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aVertexNormal;
}