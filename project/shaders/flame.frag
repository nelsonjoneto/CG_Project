precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vNormal;

uniform sampler2D uSampler;

void main() {
    // Simple texture sampling for flame color
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = texColor;
}