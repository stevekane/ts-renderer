import vsrc from './shaders/per-vertex-vsrc'
import fsrc from './shaders/per-vertex-fsrc'
import { loadXHR } from './Load'
import { GL, run, createCommand, Command, Config, UniformType as U, AttributeType as A } from './Command'
import { IRenderable } from './Rendering/core'
import { ILookAtCamera } from './Rendering/Camera'
import { parseOBJ } from './Parsers/OBJ'
import { 
  Vec3, V3, M4, lookAt, identity, perspective, 
  translate, scale, rotateX, rotateY, rotateZ 
} from './Matrix'

const now = performance ? performance.now.bind(performance) : Date.now
const c = document.getElementById('target') as HTMLCanvasElement
const gl = c.getContext('webgl') as WebGLRenderingContext

interface Box<T> { value: T }

type Indexable = { [ x: string ]: any }
type Partial<T> = { [ P in keyof T ]?: T[P] }
type Boxified<T> = { [ K in keyof T ]: Box<T[K]> }
type UniformType = number | number[] | Float32Array | Int32Array
type Uniform
  = { name: '1f', value: number }
  | { name: '2f', value: number[] | Float32Array }
  | { name: '3f', value: number[] | Float32Array }
  | { name: '4f', value: number[] | Float32Array }

function update<T extends Indexable> (b: Boxified<T>, t: T) {
  for ( var k in t ) {
    b[k].value = t[k] 
  }
}

const b = { 
  age: { value: 5 }, 
  position: { value: [ 1,2,3 ] }
}

const current = {
  age: 5,
  position: [ 3,4,5 ]
}

const another = {
  age: 6,
  position: [ 1,2,3 ] 
}

update(b, current)

console.log(b)

/*
  We want to map the spec for a given render call, to the correct type of 
  provided data.  Example below:

  const c = createCommand({ uniforms: { age: { kind: f1, value: 5 }}})

  run(gl, c, { age: 5 })        // OK -- value is number
  run(gl, c, { age: 'steve'})   // NOT OK -- value is string
  run(gl, c, { name: 'steve'})  // NOT OK -- name not in keys for command
  run(gl, c, { age: [ 0, 0 ] }) // NOT OK -- value is 2-tuple

  Each uniform is a wrapper around some type and nothing more.  As such,
  we need to wrap our raw value in a box and then un-wrap it for 
  the second API.
*/

function forPartial <A> (a: A, b: Partial<A>) {
  console.log('da same')
}

//forPartial({ name: 'steve' }, { age: 5 })
forPartial({ name: 'steve' }, { name: 'kane' })

loadXHR('pyramid.obj')
.then(parseOBJ)
.then(geometry => {
  if ( !geometry.success ) return

  const light = V3(0, 2, 0)
  const cam = {
    position: new Float32Array([ 0, 1, 5 ]),
    view: M4(),
    projection: M4(),
    vfov: Math.PI / 4,
    aspectRatio: c.width / c.height,
    near: 0.1,
    far: 10000,
    up: V3(0, 1, 0),
    at: V3(0, 0, 0)
  }
  const command = createCommand(gl, {
    vsrc,
    fsrc,
    count: 12,
    uniforms: {
      u_light: { kind: U.f3, value: V3(0, 0, 0) },
      u_model: { kind: U.mat4, value: M4() },
      u_view: { kind: U.mat4, value: M4() },
      u_projection: { kind: U.mat4, value: M4() }
    },
    attributes: {
      a_coord: { kind: A.FLOAT, value: geometry.val.vertices, size: 3 },
      a_normal: { kind: A.FLOAT, value: geometry.val.normals, size: 3 },
      // a_texCoord: { type: A.FLOAT, value: [], size: 2 },
    }
  })
  const entities = [{
    position: V3(0, 0, 0),
    scale: V3(1, 1, 1),
    rotation: V3(0, 0, 0),
    model: M4()
  }]

  requestAnimationFrame(function render () {
    const t = now()

    for ( const entity of entities ) {
      entity.rotation[1] += 0.02
      identity(entity.model)
      translate(entity.model, entity.position)
      scale(entity.model, entity.scale)
      rotateX(entity.model, entity.rotation[0])
      rotateY(entity.model, entity.rotation[1])
      rotateZ(entity.model, entity.rotation[2])
    }

    cam.aspectRatio = c.width / c.height
    lookAt(cam.view, cam.position, cam.at, cam.up)
    perspective(cam.projection, cam.vfov, cam.aspectRatio, cam.near, cam.far)

    gl.viewport(0, 0, c.width, c.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    for ( var i = 0; i < entities.length; i++ ) {
      var entity = entities[i]
      if ( command.success ) run(gl, command.value, { 
        count: 12,
        uniforms: {
          u_light: { kind: U.f3, value: light },
          u_model: { kind: U.mat4, value: entity.model },
          u_view: { kind: U.mat4, value: cam.view },
          u_projection: { kind: U.mat4, value: cam.projection }
        },
        attributes: {}
      })
    }
    requestAnimationFrame(render)
  })
})
