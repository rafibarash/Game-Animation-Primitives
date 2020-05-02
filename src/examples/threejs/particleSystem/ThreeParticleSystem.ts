import { ParticleSystemProps } from './../../../particleSystem/types';
import * as THREE from 'three';
import ParticleSystem from '../../../particleSystem/ParticleSystem';

/////////////
// SHADERS //
/////////////

// attribute: data that may be different for each particle (such as size and color);
//      can only be used in vertex shader
// varying: used to communicate data from vertex shader to fragment shader
// uniform: data that is the same for each particle (such as texture)

const particleVertexShader = [
  'attribute vec3  customColor;',
  'attribute float customOpacity;',
  'attribute float customSize;',
  'attribute float customAngle;',
  'attribute float customVisible;', // float used as boolean (0 = false, 1 = true)
  'varying vec4  vColor;',
  'varying float vAngle;',
  'void main()',
  '{',
  'if ( customVisible > 0.5 )', // true
  'vColor = vec4( customColor, customOpacity );', //     set color associated to vertex; use later in fragment shader.
  'else', // false
  'vColor = vec4(0.0, 0.0, 0.0, 0.0);', //     make particle invisible.

  'vAngle = customAngle;',

  'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
  'gl_PointSize = customSize * ( 300.0 / length( mvPosition.xyz ) );', // scale particles as objects in 3D space
  'gl_Position = projectionMatrix * mvPosition;',
  '}',
].join('\n');

const particleFragmentShader = [
  'uniform sampler2D texture;',
  'varying vec4 vColor;',
  'varying float vAngle;',
  'void main()',
  '{',
  'gl_FragColor = vColor;',

  'float c = cos(vAngle);',
  'float s = sin(vAngle);',
  'vec2 rotatedUV = vec2(c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,',
  'c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5);', // rotate UV coordinates to rotate texture
  'vec4 rotatedTexture = texture2D( texture,  rotatedUV );',
  'gl_FragColor = gl_FragColor * rotatedTexture;', // sets an otherwise white particle texture to desired color
  '}',
].join('\n');

export default class ThreeParticleSystem extends ParticleSystem {
  particleGeometry: THREE.Geometry;
  particleTexture: any;
  particleMaterial: THREE.ShaderMaterial;
  particleMesh: THREE.Mesh;

  constructor(props: ParticleSystemProps) {
    super(props);
    this.particleGeometry = new THREE.Geometry();
    this.particleTexture = null;
    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        texture: { type: 't', value: this.particleTexture },
      },
      // attributes: {
      //   customVisible: { type: 'f', value: [] },
      //   customAngle: { type: 'f', value: [] },
      //   customSize: { type: 'f', value: [] },
      //   customColor: { type: 'c', value: [] },
      //   customOpacity: { type: 'f', value: [] },
      // },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true, // alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5,
      blending: THREE.NormalBlending,
      depthTest: true,
    });
    this.particleMesh = new THREE.Mesh();
  }
}
