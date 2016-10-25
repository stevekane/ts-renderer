import vsrc from './vsrc'
import fsrc from './fsrc'
import { fromSource } from './GL-Program'
import { IRenderable, IProgram } from './Rendering/core'
import { Triangle } from './Rendering/Geometry'

// TODO: program should probably house attributs/uniforms...
function drawRenderable (gl: WebGLRenderingContext, p: IProgram, r: IRenderable) {
  gl.bindBuffer(gl.ARRAY_BUFFER, p.buffers.vertices)
  gl.bufferData(gl.ARRAY_BUFFER, entity.mesh.geometry.vertices, gl.DYNAMIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, p.buffers.normals)
  gl.bufferData(gl.ARRAY_BUFFER, entity.mesh.geometry.normals, gl.DYNAMIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, p.buffers.colors)
  gl.bufferData(gl.ARRAY_BUFFER, entity.mesh.geometry.colors, gl.DYNAMIC_DRAW)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.buffers.indices)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, entity.mesh.geometry.indices, gl.STATIC_DRAW)

  gl.uniform3f(p.uniforms.u_position, entity.position[0], entity.position[1], entity.position[2])
  gl.uniform3f(p.uniforms.u_scale, entity.scale[0], entity.scale[1], entity.scale[2])
  gl.uniform3f(p.uniforms.u_rotation, entity.rotation[0], entity.rotation[1], entity.rotation[2])
  gl.drawElements(gl.TRIANGLES, entity.mesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0)
}

const now = performance ? performance.now.bind(performance) : Date.now
const c = document.getElementById('target') as HTMLCanvasElement
const gl = c ? c.getContext('webgl') : null
const entity = {
  position: new Float32Array([ 0, 0, 0 ]),
  scale: new Float32Array([ 1, 1, 1 ]),
  rotation: new Float32Array([ 0, 0, 0 ]),
  mesh: {
    geometry: new Triangle 
  }
}

if ( gl ) {
  const p = fromSource(gl, vsrc, fsrc)
  const glData = {
    attributes: {
      a_coord: gl.getAttribLocation(p.value, 'a_coord'),
      a_normal: gl.getAttribLocation(p.value, 'a_normal'),
      a_color: gl.getAttribLocation(p.value, 'a_color')
    },
    uniforms: {
      u_position: gl.getUniformLocation(p.value, 'u_position'),
      u_scale: gl.getUniformLocation(p.value, 'u_scale'),
      u_rotation: gl.getUniformLocation(p.value, 'u_rotation')
    },
    buffers: {
      vertices: gl.createBuffer(),
      normals: gl.createBuffer(),
      colors: gl.createBuffer(),
      indices: gl.createBuffer()
    }
  }

  if ( p.success ) {
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.useProgram(p.value)

    gl.bindBuffer(gl.ARRAY_BUFFER, glData.buffers.vertices)
    gl.vertexAttribPointer(glData.attributes.a_coord, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(glData.attributes.a_coord)

    // gl.bindBuffer(gl.ARRAY_BUFFER, glData.buffers.normals)
    // gl.vertexAttribPointer(glData.attributes.a_normal, 3, gl.FLOAT, false, 0, 0)
    // gl.enableVertexAttribArray(glData.attributes.a_normal)

    gl.bindBuffer(gl.ARRAY_BUFFER, glData.buffers.colors)
    gl.vertexAttribPointer(glData.attributes.a_color, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(glData.attributes.a_color)

    requestAnimationFrame(function render () {
      const t = now()

      entity.position[0] = Math.sin(t / 1000)
      entity.scale[1] = Math.sin(t / 1000) + 1
      entity.rotation[0] = Math.sin(t / 1000) * Math.PI * 2
      entity.rotation[2] = Math.sin(t / 1000) * Math.PI * 2

      gl.viewport(0, 0, c.width, c.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      drawRenderable(gl, glData, entity)
      requestAnimationFrame(render)
    })
  } else {
    console.log(JSON.stringify(p, null, 2)) 
  }
}
