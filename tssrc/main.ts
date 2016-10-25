import vsrc from './vsrc'
import fsrc from './fsrc'
import { fromSource } from './GL-Program'

const now = performance ? performance.now.bind(performance) : Date.now
const c = document.getElementById('target') as HTMLCanvasElement
const gl = c ? c.getContext('webgl') : null
const entity = {
  position: [ 0, 0, 0 ],
  rotation: [ 0, 0, 0 ],
  scale: [ 1, 1, 1 ],
  vertices: new Float32Array([ 
    0, -0.1, 0,    
    0.1, 0.1, 0,    
    -0.1, 0.1, 0 
  ]),
  colors: new Float32Array([ 
    1.0, 1.0, 0.5, 1.0 ,
    1.0, 0.5, 1.0, 1.0 ,
    0.5, 1.0, 1.0, 1.0 
  ]),
  indices: new Uint16Array([ 0, 1, 2 ])
}

if ( gl ) {
  const p = fromSource(gl, vsrc, fsrc)

  if ( !p.success ) console.log(JSON.stringify(p, null, 2))
  else {  
    const attributes = {
      a_coord: gl.getAttribLocation(p.value, 'a_coord'),
      a_color: gl.getAttribLocation(p.value, 'a_color')
    }
    const uniforms = {
      u_time: gl.getUniformLocation(p.value, 'u_time'),
      u_position: gl.getUniformLocation(p.value, 'u_position'),
      u_scale: gl.getUniformLocation(p.value, 'u_scale'),
      u_rotation: gl.getUniformLocation(p.value, 'u_rotation')
    }
    const vertexBuffer = gl.createBuffer()
    const colorBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.useProgram(p.value)

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, entity.vertices, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(attributes.a_coord, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(attributes.a_coord)

    // Vertex colors
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, entity.colors, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(attributes.a_color, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(attributes.a_color)

    // Indices into vertex buffers
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, entity.indices, gl.STATIC_DRAW)

    requestAnimationFrame(function render () {
      const t = now()

      //entity.position[0] = Math.sin(t / 1000)
      //entity.scale[1] = Math.sin(t / 1000) + 1
      entity.rotation[0] = Math.sin(t / 1000) * Math.PI * 2
      entity.rotation[1] = Math.sin(t / 1000) * Math.PI * 2

      gl.viewport(0, 0, c.width, c.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.uniform1f(uniforms.u_time, t)
      gl.uniform3f(uniforms.u_position, entity.position[0], entity.position[1], entity.position[2])
      gl.uniform3f(uniforms.u_scale, entity.scale[0], entity.scale[1], entity.scale[2])
      gl.uniform3f(uniforms.u_rotation, entity.rotation[0], entity.rotation[1], entity.rotation[2])
      gl.drawElements(gl.TRIANGLES, entity.indices.length, gl.UNSIGNED_SHORT, 0)
      requestAnimationFrame(render)
    })
  }
}
