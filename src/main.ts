import vsrc from './vsrc'
import fsrc from './fsrc'
import { loadXHR } from './Load'
import { fromSource } from './GL-Program'
import { IRenderable } from './Rendering/core'
import { ILookAtCamera } from './Rendering/Camera'
import { parseOBJ } from './Parsers/OBJ'
import { V3, M4, lookAt, perspective } from './Matrix'

function drawRenderable (gl: WebGLRenderingContext, cam: ILookAtCamera, r: IRenderable) {
  const { program, attributes, uniforms, geometry } = r.mesh

  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.a_coord)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(attributes.a_coord, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(attributes.a_coord)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, r.buffers.indices)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

  gl.uniform1f(uniforms.u_time, now()) 
  gl.uniform3f(uniforms.u_position, r.position[0], r.position[1], r.position[2])
  gl.uniform3f(uniforms.u_rotation, r.rotation[0], r.rotation[1], r.rotation[2])
  gl.uniform3f(uniforms.u_scale, r.scale[0], r.scale[1], r.scale[2])
  gl.uniformMatrix4fv(uniforms.u_view, false, cam.view)
  gl.uniformMatrix4fv(uniforms.u_projection, false, cam.projection)
  gl.drawElements(gl.TRIANGLE_FAN, geometry.indices.length, gl.UNSIGNED_SHORT, 0)
}

const now = performance ? performance.now.bind(performance) : Date.now
const c = document.getElementById('target') as HTMLCanvasElement
const gl = c.getContext('webgl') as WebGLRenderingContext
const p = fromSource(gl, vsrc, fsrc)

gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.depthFunc(gl.LEQUAL)

if ( p.success ) {
  loadXHR('pyramid.obj')
  .then(parseOBJ)
  .then(parsedGeometry => {
    if ( !parsedGeometry.success ) return

    console.log(parsedGeometry.val)
    const entity = {
      position: new Float32Array([ 0, 0, 0 ]),
      scale: new Float32Array([ 1, 1, 1 ]),
      rotation: new Float32Array([ 0, 0, 0 ]),
      mesh: {
        geometry: parsedGeometry.val,
        program: p.value,
        uniforms: {
          u_time: gl.getUniformLocation(p.value, 'u_time') as WebGLUniformLocation,
          u_position: gl.getUniformLocation(p.value, 'u_position') as WebGLUniformLocation,
          u_scale: gl.getUniformLocation(p.value, 'u_scale') as WebGLUniformLocation,
          u_rotation: gl.getUniformLocation(p.value, 'u_rotation') as WebGLUniformLocation,
          u_view: gl.getUniformLocation(p.value, 'u_view') as WebGLUniformLocation,
          u_projection: gl.getUniformLocation(p.value, 'u_projection') as WebGLUniformLocation
        },
        attributes: {
          a_coord: gl.getAttribLocation(p.value, 'a_coord') as number,
        }
      },
      buffers: {
        a_coord: gl.createBuffer() as WebGLBuffer,
        a_normal: gl.createBuffer() as WebGLBuffer,
        indices: gl.createBuffer() as WebGLBuffer
      }
    }
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

    requestAnimationFrame(function render () {
      const t = now()

      entity.rotation[1] = Math.cos(t / 5000) * Math.PI * 2

      cam.aspectRatio = c.width / c.height
      lookAt(cam.view, cam.position, cam.at, cam.up)
      perspective(cam.projection, cam.vfov, cam.aspectRatio, cam.near, cam.far)

      gl.viewport(0, 0, c.width, c.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      drawRenderable(gl, cam, entity)
      requestAnimationFrame(render)
    })
  })
} else {
  console.log(JSON.stringify(p, null, 2)) 
}
