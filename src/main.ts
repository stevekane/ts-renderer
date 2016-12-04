import vsrc from './shaders/test-vsrc'
import fsrc from './shaders/test-fsrc'
import pvvsrc from './shaders/per-vertex-vsrc'
import pvfsrc from './shaders/per-vertex-fsrc'
import { loadXHR } from './Load'
import { parseOBJ } from './Parsers/OBJ'
import { V3, M4, identity, translate, rotateX, rotateY, rotateZ, scale, lookAt, perspective } from './Matrix'
import { Attributes, Uniforms, Command } from './Commando'

const c = document.getElementById('target') as HTMLCanvasElement
const gl = c.getContext('webgl') as WebGLRenderingContext

loadXHR('pyramid.obj')
.then(parseOBJ)
.then(geometry => {
  if ( !geometry.success ) return

  const screenQuad = new Float32Array([
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0
  ])
  const keys = new Array(256)
  const light = V3(0, 2, 0)
  const vertices = new Float32Array(geometry.val.vertices)
  const normals = new Float32Array(geometry.val.normals)
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
  const transform = {
    position: V3(0, 0, 0),
    scale: V3(1, 1, 1),
    rotation: V3(0, 0, 0),
    model: M4()
  }
  const command = Command.createCommand(gl, {
    vsrc, 
    fsrc, 
    uniforms: {
      u_color: new Uniforms.U4F([ 0, 1, 0, 1 ]),
      u_time: new Uniforms.UF(performance.now())
    },
    attributes: {
      a_position: new Attributes.Floats(3, screenQuad)
    }
  })
  const drawPyramid = Command.createCommand(gl, {
    vsrc: pvvsrc,
    fsrc: pvfsrc,
    uniforms: {
      u_light: new Uniforms.U3F([ 0, 0, 0 ]),
      u_model: new Uniforms.UMatrix4(M4()),
      u_view: new Uniforms.UMatrix4(M4()),
      u_projection: new Uniforms.UMatrix4(M4())
    },
    attributes: {
      a_coord: new Attributes.Floats(3, vertices),
      a_normal: new Attributes.Floats(3, normals)
    }
  })
  if ( command instanceof Error || drawPyramid instanceof Error ) {
    console.log(command) 
    console.log(drawPyramid)
  }
  else {
    var t = 0
    const render = function render () {
      t++

      if ( keys[37] ) transform.rotation[1] -= 0.05
      if ( keys[39] ) transform.rotation[1] += 0.05

      light[0] = Math.cos(t / 10) * 2
      light[2] = Math.sin(t / 10) * 2
      identity(transform.model)
      translate(transform.model, transform.position)
      scale(transform.model, transform.scale)
      rotateX(transform.model, transform.rotation[0])
      rotateY(transform.model, transform.rotation[1])
      rotateZ(transform.model, transform.rotation[2])
      cam.aspectRatio = c.width / c.height
      lookAt(cam.view, cam.position, cam.at, cam.up)
      perspective(cam.projection, cam.vfov, cam.aspectRatio, cam.near, cam.far)

      gl.enable(gl.CULL_FACE)
      gl.cullFace(gl.BACK)
      gl.viewport(0, 0, c.width, c.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      Command.run(command, { 
        uniforms: { 
          u_time: performance.now()
        },
        count: 6 
      })
      Command.run(drawPyramid, {
        uniforms: {
          u_light: light,
          u_model: transform.model,
          u_view: cam.view,
          u_projection: cam.projection 
        },
        count: geometry.val.vertices.length / 3
      })
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)

    document.body.addEventListener('keydown', ({ keyCode }) => keys[keyCode] = 1)
    document.body.addEventListener('keyup', ({ keyCode }) => keys[keyCode] = 0)
  }
})
