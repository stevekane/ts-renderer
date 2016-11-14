import vsrc from './shaders/per-vertex-vsrc'
import fsrc from './shaders/per-vertex-fsrc'
import { loadXHR } from './Load'
import { GL, run, createCommand, Command, Config, UNIFORM_TYPE as U, ATTRIBUTE_TYPE as A } from './Command'
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
      u_light: { kind: U.f3, vector: V3(0, 0, 0) },
      u_model: { kind: U.matrix4fv, matrices: M4() },
      u_view: { kind: U.matrix4fv, matrices: M4() },
      u_projection: { kind: U.matrix4fv, matrices: M4() }
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

    for ( var i = 0; i < entities.length; i++ ) {
      var entity = entities[i]

      entity.rotation[1] = Math.cos(t / 5000) * Math.PI * 2
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
          u_light: { kind: U.f3, vector: light },
          u_model: { kind: U.matrix4fv, matrices: entity.model },
          u_view: { kind: U.matrix4fv, matrices: cam.view },
          u_projection: { kind: U.matrix4fv, matrices: cam.projection }
        },
        attributes: {}
      })
    }
    requestAnimationFrame(render)
  })
})
