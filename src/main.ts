import vsrc from './shaders/per-vertex-vsrc'
import fsrc from './shaders/per-vertex-fsrc'
import { loadXHR } from './Load'
import { createCommand } from './Command'
import { IRenderable } from './Rendering/core'
import { ILookAtCamera } from './Rendering/Camera'
import { parseOBJ } from './Parsers/OBJ'
import { 
  Vec3, V3, M4, lookAt, identity, perspective, 
  translate, scale, rotateX, rotateY, rotateZ 
} from './Matrix'

function drawRenderable (gl: WebGLRenderingContext, cam: ILookAtCamera, light: Vec3, r: IRenderable) {
  const { program, attributes, uniforms, geometry } = r.mesh
  const modelMatrix = r.model

  identity(modelMatrix)
  translate(modelMatrix, r.position)
  scale(modelMatrix, r.scale)
  rotateX(modelMatrix, r.rotation[0])
  rotateY(modelMatrix, r.rotation[1])
  rotateZ(modelMatrix, r.rotation[2])

  // All GL State setup and a single function call below here:
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.depthFunc(gl.LEQUAL)
  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.a_coord)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(attributes.a_coord, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(attributes.a_coord)

  gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.a_normal)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(attributes.a_normal, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(attributes.a_normal)

  // gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.a_texCoord)
  // gl.bufferData(gl.ARRAY_BUFFER, geometry.texCoords, gl.DYNAMIC_DRAW)
  // gl.vertexAttribPointer(attributes.a_texCoord, 2, gl.FLOAT, false, 0, 0)
  // gl.enableVertexAttribArray(attributes.a_texCoord)

  gl.uniform1f(uniforms.u_time, now()) 
  gl.uniform3f(uniforms.u_light, light[0], light[1], light[2])
  gl.uniformMatrix4fv(uniforms.u_model, false, modelMatrix)
  gl.uniformMatrix4fv(uniforms.u_view, false, cam.view)
  gl.uniformMatrix4fv(uniforms.u_projection, false, cam.projection)

  gl.drawArrays(gl.TRIANGLES, 0, geometry.vertices.length / 3)
}

const now = performance ? performance.now.bind(performance) : Date.now
const c = document.getElementById('target') as HTMLCanvasElement
const gl = c.getContext('webgl') as WebGLRenderingContext
const command = createCommand(gl, {
  vsrc,
  fsrc,
  uniforms: {
    u_time: { type: '1f', val: 0 },
    u_light: { type: '3f', x: 0, y: 0, z: 0 },
    u_model: { type: 'matrix4fv', buffer: M4() },
    u_view: { type: 'matrix4fv', buffer: M4() },
    u_projection: { type: 'matrix4fv', buffer: M4() }
  },
  attributes: {}
})

console.log(command)

if ( command.success ) {
  loadXHR('pyramid.obj')
  .then(parseOBJ)
  .then(parsedGeometry => {
    if ( !parsedGeometry.success ) return

    const entity = {
      position: V3(0, 0, 0),
      scale: V3(1, 1, 1),
      rotation: V3(0, 0, 0),
      model: M4(),
      mesh: {
        geometry: parsedGeometry.val,
        program: command.value.program,
        uniforms: {
          u_time: gl.getUniformLocation(command.value.program, 'u_time') as WebGLUniformLocation,
          u_light: gl.getUniformLocation(command.value.program, 'u_light') as WebGLUniformLocation,
          u_model: gl.getUniformLocation(command.value.program, 'u_model') as WebGLUniformLocation,
          u_view: gl.getUniformLocation(command.value.program, 'u_view') as WebGLUniformLocation,
          u_projection: gl.getUniformLocation(command.value.program, 'u_projection') as WebGLUniformLocation
        },
        attributes: {
          a_coord: gl.getAttribLocation(command.value.program, 'a_coord') as number,
          a_normal: gl.getAttribLocation(command.value.program, 'a_normal') as number,
          a_texCoord: gl.getAttribLocation(command.value.program, 'a_texCoord') as number
        }
      },
      buffers: {
        a_coord: gl.createBuffer() as WebGLBuffer,
        a_normal: gl.createBuffer() as WebGLBuffer,
        a_texCoord: gl.createBuffer() as WebGLBuffer
      }
    }
    const entities = [ entity ]
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

    requestAnimationFrame(function render () {
      const t = now()

      for ( var i = 0; i < entities.length; i++ ) {
        entities[i].rotation[1] = Math.cos(t / 5000) * Math.PI * 2
      }

      light[0] = Math.sin(t / 1000) * 4

      cam.aspectRatio = c.width / c.height
      lookAt(cam.view, cam.position, cam.at, cam.up)
      perspective(cam.projection, cam.vfov, cam.aspectRatio, cam.near, cam.far)

      gl.viewport(0, 0, c.width, c.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      for ( var j = 0; j < entities.length; j++ ) {
        drawRenderable(gl, cam, light, entities[j])
      }
      requestAnimationFrame(render)
    })
  })
} else {
  console.log(command.value)
}
