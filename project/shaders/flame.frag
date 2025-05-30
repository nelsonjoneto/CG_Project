// Fragment Shader: flame.frag

precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vNormal;

uniform sampler2D uSampler;

void main() {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = texColor;
}
