type Block<T> = { [ x: string ]: T }

export type JSType
  = number  | number[]
  | boolean | boolean[]
  | string  | string[]

export enum TYPE {
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

export enum SEMANTIC {
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
  MODELINVERSETRANSPOSE, // gl_float_mat3
  MODELVIEWINVERSETRANSPOSE, //gl_float_mat3
  VIEWPORT, //gl_float_vec4
  JOINTMATRIX,
  POSITION,
  NORMAL,
  TEXCOORD,
  COLOR,
  JOINT,
  WEIGHT
}

export type Parameter = {
  count?: number
  node?: Node
  type: TYPE
  semantic?: string
  value?: JSType
}

export interface Attribute {
  
}

export interface Uniform {

}

export interface Technique {
  program: WebGLProgram
  parameters?: Block<Parameter>
  attributes?: Block<Attribute>
  uniforms?: Block<Uniform>
}
