import * as Technique from './Technique'

type Block<T> = { [ x: string ]: T }

export enum ComponentType {
  BYTE = 5120,
  UNSIGNED_BYTE = 5121,
  SHORT = 5122,
  UNSIGNED_SHORT = 5123,
  FLOAT = 5126
}

export enum BufferViewTarget { 
  ARRAY_BUFFER = 34962, 
  ELEMENT_ARRAY_BUFFER
}

export enum PrimitiveMode {
  POINTS = 0,
  LINES,
  LINE_LOOP,
  LINE_STRIP,
  TRIANGLES,
  TRIANGLE_STRIP,
  TRIANGLE_FAN
}

export interface BufferView { 
  buffer: ArrayBuffer
  byteLength: number
  byteOffset: number
  target?: BufferViewTarget
}

export interface Accessor { 
  bufferView: BufferView
  byteOffset: number
  byteStride?: number
  componentType: ComponentType
  count: number
  // type: ParameterType
}

export interface Mesh {
  primitives: Primitive[]
  name: string
}

export interface Primitive {
  attributes: Block<Accessor>
  indices?: Accessor
  mode: PrimitiveMode
  // material: Material
}

// TODO: matrix is actually one of two possible options for transform
// can also be any of translation/scale/rotation all of which have Identity defaults
export interface SceneNode {
  matrix: Float32Array
  children: SceneNode[]
  meshes: Mesh[]
  name: string
}

export interface Program {
  attributes: string[]
  fragmentShader: string
  vertexShader: string
}

export interface GLTF<A, E> {
  accessors: Block<Accessor>
  // animations: Block<Animation>
  buffers: Block<ArrayBuffer> 
  bufferViews: Block<BufferView>
  // cameras: Block<Camera>
  // images: Block<Image>
  // materials: Block<Material>
  meshes: Block<Mesh>
  nodes: Block<SceneNode>
  programs: Block<Program>
  // samplers: Block<Sampler>
  // scene?: Scene // optional scene
  // scenes: Block<Scene>
  // shaders: Block<Shader>
  // skins: Block<Skin>
  // techniques: Block<Technique>
  // textures: Block<Texture>
  // extensionsUsed: string[]
}
