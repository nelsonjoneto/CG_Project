#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {

	vec4 color = texture2D(uSampler, vTextureCoord);

	vec4 colorSepia = color;
	float L = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    vec3 grayscale = vec3(L);
    gl_FragColor = vec4(grayscale, color.a);
}