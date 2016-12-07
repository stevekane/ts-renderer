import { loadString, loadBinary, loadImage } from './Load'
import { parseOBJ } from './Parsers/OBJ'
import { V3, M4, identity, translate, rotateX, rotateY, rotateZ, scale, lookAt, perspective } from './Matrix'
import { Attributes, Uniforms, Command } from './Commando'
import { containing } from './utils'

const F32_BYTE_SIZE = 4

interface Scene {
  count: number
  program: WebGLProgram
  buffer: ArrayBuffer
  bufferViews: {
    a_position: ArrayBufferView
    a_color: ArrayBufferView
  }
  textures: {
    diffuse: HTMLImageElement 
  }
}

async function load ( gl: WebGLRenderingContext ): Promise<Scene | Error> {
  const [ vsrc, fsrc, diffuse, buffer ] = await Promise.all([ 
    loadString('brick/vertex.glsl'),
    loadString('brick/fragment.glsl'),
    loadImage('brick/diffuse.jpg'),
    loadBinary('brick/data.bin')
  ])
  const positionCount = 9
  const colorCount = 12
  const program = Command.fromSource(gl, vsrc, fsrc)
  const bufferViews = {
    a_position: new Float32Array(buffer, 0, positionCount),
    a_color: new Float32Array(buffer, positionCount * F32_BYTE_SIZE, colorCount)
  }
  const textures = {
    diffuse 
  }

  return program instanceof Error 
    ? program
    : { count: 3, program, buffer, bufferViews, textures }
}

async function main ( gl: WebGLRenderingContext ) { 
  const sceneData = await load(gl)

  if ( sceneData instanceof Error ) return

  const { count, buffer: b, program: p, bufferViews: { a_position, a_color } } = sceneData
  const a_loc = {
    a_position: gl.getAttribLocation(p, 'a_position'),
    a_color: gl.getAttribLocation(p, 'a_color')
  }
  const u_loc = {
    u_time: gl.getUniformLocation(p, 'u_time') 
  }
  const glBuffer = gl.createBuffer()

  gl.enable(gl.CULL_FACE)
  gl.cullFace(gl.BACK)
  gl.clearColor(0, 0, 0, 0)

  gl.useProgram(p)
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, b, gl.DYNAMIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.useProgram(null)
  
  const render = function render () {
    gl.viewport(0, 0, c.width, c.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(p)
    gl.uniform1f(u_loc.u_time, performance.now())
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
    gl.enableVertexAttribArray(a_loc.a_position)
    gl.vertexAttribPointer(a_loc.a_position, 3, gl.FLOAT, false, 0, a_position.byteOffset)
    gl.enableVertexAttribArray(a_loc.a_color)
    gl.vertexAttribPointer(a_loc.a_color, 4, gl.FLOAT, false, 0, a_color.byteOffset)

    gl.drawArrays(gl.TRIANGLES, 0, count)

    gl.disableVertexAttribArray(a_loc.a_position)
    gl.disableVertexAttribArray(a_loc.a_color)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.useProgram(null)

    requestAnimationFrame(render)
  }
  render()
}

const c = document.getElementById('target') as HTMLCanvasElement
const gl = c.getContext('webgl') as WebGLRenderingContext

main(gl)
