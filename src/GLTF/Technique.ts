type Block<T> = { 
  [ x: string ]: T
}

/*
  here are some invariants

  - count never present on attributes
  - count may be present for any GLType in a uniform.  This means it's a vector
  of that type
  - uniforms and attributes have different semantics ( pre-defined meanings for certain values )
  - uniformsemantics must match with certain values of GLType.  Only these combinations
  are actually valid UniformParameter types. 
  - attributesemantics must match certain values of GLType.  Only these combinations
  are actually valid AttributeParameter types.
  - uniforms may have values associated with them.  
    Image
    number[]
    boolean[]
    number
    boolean
*/

export const enum GLType {
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

const enum AttributeSemanticPrefix {
  POSITION,
  NORMAL,
  TEXCOORD,
  COLOR,
  JOINT,
  WEIGHT
}

type AttributeSemantic = { 
  prefix: AttributeSemanticPrefix, 
  index: number
}

const enum UniformMat4Semantic {
  LOCAL,
  MODEL,
  VIEW,
  PROJECTION,
  MODELVIEW,
  MODELVIEWPROJECTION,
  MODELINVERSE,
  VIEWINVERSE,
  PROJECTIONINVERSE,
  MODELVIEWINVERSE,
  MODELVIEWPROJECTIONINVERSE,
  JOINTMATRIX
}

const enum UniformMat3Semantic {
  MODELINVERSETRANSPOSE,
  MODELVIEWINVERSETRANSPOSE,
  MODELVIEWPROJECTIONINVERSETRANSPOSE
}

const enum UniformVec4Semantic {
  VIEWPORT
}

function isSemanticMat4 ( f: Uniform ): f is SemanticMat4 {
  return f.hasOwnProperty('semantic')
}
function isSemanticMat3 ( f: Uniform ): f is SemanticMat3 {
  return f.hasOwnProperty('semantic')
}
function isSemanticVec4 ( f: Uniform ): f is SemanticVec4 {
  return f.hasOwnProperty('semantic')
}

type AsNumber
  = GLType.BYTE
  | GLType.UNSIGNED_BYTE
  | GLType.SHORT
  | GLType.UNSIGNED_SHORT
  | GLType.INT
  | GLType.UNSIGNED_INT
  | GLType.FLOAT
type AsNumbers
  = GLType.FLOAT_VEC2
  | GLType.FLOAT_VEC3
  | GLType.FLOAT_VEC4
  | GLType.INT_VEC2
  | GLType.INT_VEC3
  | GLType.INT_VEC4
  | GLType.FLOAT_MAT2 
  | GLType.FLOAT_MAT3
  | GLType.FLOAT_MAT4
type AsBools
  = GLType.BOOL_VEC2
  | GLType.BOOL_VEC3
  | GLType.BOOL_VEC4

type SemanticMat4 = { type: GLType.FLOAT_MAT4, semantic: UniformMat4Semantic, value?: number[] }
type SemanticMat3 = { type: GLType.FLOAT_MAT3, semantic: UniformMat3Semantic, value?: number[] }
type SemanticVec4 = { type: GLType.FLOAT_VEC4, semantic: UniformVec4Semantic, value?: number[] }

export type Uniform
  = SemanticMat4
  | SemanticMat3
  | SemanticVec4
  | { type: AsNumber, count?: number, value?: number }
  | { type: AsNumbers, count?: number, value?: number[] }
  | { type: GLType.BOOL, count?: number, value?: boolean }
  | { type: AsBools, count?: number, value?: boolean[] }
  | { type: GLType.SAMPLER_2D, value?: HTMLImageElement }

function test ( f: Uniform ) {
  switch ( f.type ) {
    case GLType.FLOAT_MAT4: return isSemanticMat4(f) ? console.log(f.semantic) : f.count
    case GLType.FLOAT_MAT3: return isSemanticMat3(f) ? console.log(f.semantic) : f.count
    case GLType.FLOAT_VEC4: return isSemanticVec4(f) ? console.log(f.semantic) : f.count
    case GLType.SAMPLER_2D: return console.log(f.type)
    case GLType.FLOAT: return console.log(f.type)
    case GLType.FLOAT_MAT2: return console.log(f.type)
    case GLType.BYTE: return console.log(f.type)
    case GLType.FLOAT_VEC2: return console.log(f.type)
    case GLType.FLOAT_VEC3: return console.log(f.type)
    case GLType.UNSIGNED_BYTE: return console.log(f.type)
    case GLType.SHORT: return console.log(f.type)
    case GLType.UNSIGNED_SHORT: return console.log(f.type)
    case GLType.INT: return console.log(f.type)
    case GLType.UNSIGNED_INT: return console.log(f.type)
    case GLType.INT_VEC2: return console.log(f.type)
    case GLType.INT_VEC3: return console.log(f.type)
    case GLType.INT_VEC4: return console.log(f.type)
    case GLType.BOOL: return console.log(f.type)
    case GLType.BOOL_VEC2: return console.log(f.type)
    case GLType.BOOL_VEC3: return console.log(f.type)
    case GLType.BOOL_VEC4: return console.log(f.type)
    default: const n: never = f
             return n
  }
}

// TODO: these are just examples
test({ type: GLType.FLOAT_MAT4, semantic: UniformMat4Semantic.JOINTMATRIX })
test({ type: GLType.FLOAT_MAT3 })
test({ type: GLType.SAMPLER_2D })

export interface Attribute {}

export interface Technique {
  program: WebGLProgram
  attributes?: Block<Attribute>
  uniforms?: Block<Uniform>
}
