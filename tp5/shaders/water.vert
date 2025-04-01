attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float timeFactor;
uniform sampler2D uSampler2; // waterMap (usado só aqui)

varying vec2 vTextureCoord;

void main() {
    vec2 displacedTexCoord = aTextureCoord + vec2(sin(timeFactor * 0.1), cos(timeFactor * 0.1)) * 0.05;
    vTextureCoord = displacedTexCoord;

    float height = texture2D(uSampler2, displacedTexCoord).r;
    vec3 displacedPosition = aVertexPosition + vec3(0.0, height * 0.5, 0.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
}
