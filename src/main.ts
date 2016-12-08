import { loadString, loadBinary, loadImage } from './Load'
import { parseOBJ } from './Parsers/OBJ'
import { V3, M4, identity, translate, rotateX, rotateY, rotateZ, scale, lookAt, perspective } from './Matrix'
import { Attributes, Uniforms, Command } from './Commando'

const F32_BYTE_SIZE = 4

interface Scene {
  count: number
  program: WebGLProgram
  buffer: ArrayBuffer
  bufferViews: {
    a_position: ArrayBufferView
    a_color: ArrayBufferView
    a_texCoord: ArrayBufferView
  }
  textures: {
    diffuse: HTMLImageElement 
  }
}

async function load ( gl: WebGLRenderingContext ): Promise<Scene | Error> {
  const loadVert = loadString('brick/vertex.glsl')
  const loadFrag = loadString('brick/fragment.glsl')
  const loadTex = loadImage('brick/diffuse.jpg')
  const loadBuf = loadBinary('brick/data.bin')
  const [ vsrc, fsrc, diffuse, buffer ] = await Promise.all([ loadVert, loadFrag, loadTex, loadBuf ])
  const program = Command.fromSource(gl, vsrc, fsrc)

  // This data would come from a schema file
  const positionCount = 9
  const colorCount = 12
  const texCount = 6
  const bufferViews = {
    a_position: new Float32Array(buffer, 0, positionCount),
    a_color: new Float32Array(buffer, positionCount * F32_BYTE_SIZE, colorCount),
    a_texCoord: new Float32Array(buffer, (positionCount + colorCount) * F32_BYTE_SIZE, texCount)
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

  const { count, buffer: b, program: p, bufferViews: { a_position, a_color, a_texCoord }, textures: { diffuse } } = sceneData
  const a_loc = {
    a_position: gl.getAttribLocation(p, 'a_position'),
    a_color: gl.getAttribLocation(p, 'a_color'),
    a_texCoord: gl.getAttribLocation(p, 'a_texCoord')
  }
  const u_loc = {
    u_time: gl.getUniformLocation(p, 'u_time'),
    u_diffuse: gl.getUniformLocation(p, 'u_diffuse')
  }
  const glBuffer = gl.createBuffer()
  const textureDiffuse = gl.createTexture()

  gl.enable(gl.CULL_FACE)
  gl.cullFace(gl.BACK)
  gl.clearColor(0, 0, 0, 0)

  gl.useProgram(p)
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, b, gl.DYNAMIC_DRAW)

  gl.bindTexture(gl.TEXTURE_2D, textureDiffuse)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, diffuse)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.useProgram(null)
  
  const render = function render () {
    gl.viewport(0, 0, c.width, c.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(p)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureDiffuse)
    gl.uniform1i(u_loc.u_diffuse, 0) // this 0 is the texture register for gl.TEXTURE0
    gl.uniform1f(u_loc.u_time, performance.now())

    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
    gl.enableVertexAttribArray(a_loc.a_position)
    gl.vertexAttribPointer(a_loc.a_position, 3, gl.FLOAT, false, 0, a_position.byteOffset)
    gl.enableVertexAttribArray(a_loc.a_color)
    gl.vertexAttribPointer(a_loc.a_color, 4, gl.FLOAT, false, 0, a_color.byteOffset)
    gl.enableVertexAttribArray(a_loc.a_texCoord)
    gl.vertexAttribPointer(a_loc.a_texCoord, 2, gl.FLOAT, false, 0, a_texCoord.byteOffset)

    gl.drawArrays(gl.TRIANGLES, 0, count)

    gl.disableVertexAttribArray(a_loc.a_position)
    gl.disableVertexAttribArray(a_loc.a_color)
    gl.disableVertexAttribArray(a_loc.a_texCoord)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null)

    requestAnimationFrame(render)
  }
  render()
}

const c = document.getElementById('target') as HTMLCanvasElement
const gl = c.getContext('webgl') as WebGLRenderingContext

main(gl)
