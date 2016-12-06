/*
  At-a-glance understanding of GLTF

  <Buffer> stores binary data
  <BufferView> refer to slices of a <Buffer> by bytelength ( no type/stride info )
  <Accessor> adds information to <BufferView> like stride, type, offset, count
  <Mesh> List of <Primitive> and optional name
  <Primitive> lists Attributes/Indices? by <Accessor> and Material and drawing mode ( Triangles, etc )
  <Node> contains <Mesh>[], matrix transform, children <Node>[], and name
  // TODO: <Material> <Technique> <Camera> <Animation> <Program> <Scene>
*/

type Block<T> = { [ x: string ]: T }

// Type of attributeArray
enum GLTFComponentType {
  BYTE = 5120,
  UNSIGNED_BYTE = 5121,
  SHORT = 5122,
  UNSIGNED_SHORT = 5123,
  FLOAT = 5126
}

// Type of Buffer ( attr vs index essentially )
enum GLTFBufferViewTarget { 
  ARRAY_BUFFER = 34962, 
  ELEMENT_ARRAY_BUFFER
}

// Draw modes
enum GLTFPrimitiveMode {
  POINTS = 0,
  LINES,
  LINE_LOOP,
  LINE_STRIP,
  TRIANGLES,
  TRIANGLE_STRIP,
  TRIANGLE_FAN
}

// The type of an attribute ( accessor )
enum GLTFParameterType {
  BYTE = 5120,
  UNSIGNED_BYTE = 5121,
  SHORT = 5122,
  UNSIGNED_SHORT = 5123,
  INT = 5124,
  UNSIGNED_INT = 5125,
  FLOAT = 5126,
  FLOAT_VEC2 = 35664,
  FLOAT_VEC3 = 35665,
  FLOAT_VEC4 = 35666,
  INT_VEC2 = 35667,
  INT_VEC3 = 35668,
  INT_VEC4 = 35669,
  BOOL = 35670,
  BOOL_VEC2 = 35671,
  BOOL_VEC3 = 35672,
  BOOL_VEC4 = 35673,
  FLOAT_MAT2 = 35674,
  FLOAT_MAT3 = 35675,
  FLOAT_MAT4 = 35676,
  SAMPLER_2D = 35678
}

// An attribute.  Parameterize bufferView with stride, offset, count, and type
interface GLTFAccessor { 
  bufferView: GLTFBufferView
  componentType: GLTFComponentType
  byteStride: number
  byteOffset: number
  count: number
  type: GLTFParameterType
}

// Chunk of buffer of given byteLength/byteOffset
interface GLTFBufferView { 
  view: ArrayBufferView 
  target: GLTFBufferViewTarget
}

// Collection of primitives ( draw-calls, roughly )
interface GLTFMesh {
  primitives: GLTFPrimitive[]
  name: string
}

// A "draw-call" roughly. attributes/indices?, material and draw-mode
interface GLTFPrimitive {
  attributes: Block<GLTFAccessor>
  indices?: GLTFAccessor
  mode: GLTFPrimitiveMode
  // material: GLTFMaterial
}

// Instance of mesh in the scene w/ transform, children, and name
interface GLTFNode {
  matrix: Float32Array
  children: GLTFNode[]
  meshes: GLTFMesh[]
  name: string
}

// (meta)-data for webgl program
interface GLTFProgram {
  attributes: string[]
  fragmentShader: string
  vertexShader: string
}

// root object
interface GLTFAsset<A, E> {
  accessors: Block<GLTFAccessor>
  // animations: Block<GLTFAnimation>
  // asset: A // optional meta-data
  buffers: Block<GLTFBuffer> 
  bufferViews: Block<GLTFBufferView>
  // cameras: Block<GLTFCamera>
  // images: Block<GLTFImage>
  // materials: Block<GLTFMaterial>
  meshes: Block<GLTFMesh>
  nodes: Block<GLTFNode>
  programs: Block<GLTFProgram>
  // samplers: Block<GLTFSampler>
  // scene?: GLTFScene // optional scene
  // scenes: Block<GLTFScene>
  // shaders: Block<GLTFShader>
  // skins: Block<GLTFSkin>
  // techniques: Block<GLTFTechnique>
  // textures: Block<GLTFTexture>
  // extensionsUsed: string[]
  // extensions?: Block<string> // extension-specific objects
  // extras?: E // optional app-specific data
}
