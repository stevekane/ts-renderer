import vsrc from './shaders/test-vsrc'
import fsrc from './shaders/test-fsrc'
import { Attributes, Uniforms, Command } from './Commando'

const c = document.getElementById('target') as HTMLCanvasElement
const gl = c.getContext('webgl') as WebGLRenderingContext
const command = Command.createCommand(gl, {
  vsrc, 
  fsrc, 
  uniforms: {
    u_color: new Uniforms.U4F([ 0, 1, 0, 1 ]),
    u_time: new Uniforms.UF(performance.now())
  },
  attributes: {
    a_position: new Attributes.Floats(3, new Float32Array([ 
      -1.0, -1.0,  0.0,
      1.0, -1.0,  0.0,
      1.0,  1.0,  0.0,
      -1.0, -1.0,  0.0,
      1.0,  1.0,  0.0,
      -1.0,  1.0,  0.0
    ]))
  }
})

function render () {
  gl.viewport(0, 0, c.width, c.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  if ( command instanceof Error ) {
    console.log(command.message)
  }
  else {
    Command.run(command, { 
      uniforms: { 
        u_time: performance.now()
      },
      count: 6 
    })
    requestAnimationFrame(render)
  }
}

render()


// loadXHR('pyramid.obj')
// .then(parseOBJ)
// .then(geometry => {
//   if ( !geometry.success ) return
// 
//   const light = V3(0, 2, 0)
//   const cam = {
//     position: new Float32Array([ 0, 1, 5 ]),
//     view: M4(),
//     projection: M4(),
//     vfov: Math.PI / 4,
//     aspectRatio: c.width / c.height,
//     near: 0.1,
//     far: 10000,
//     up: V3(0, 1, 0),
//     at: V3(0, 0, 0)
//   }
//   const command = createCommand(gl, {
//     vsrc,
//     fsrc,
//     count: 12,
//     uniforms: {
//       u_light: { kind: U.F3, value: V3(0, 0, 0) },
//       u_model: { kind: U.MAT4, value: M4() },
//       u_view: { kind: U.MAT4, value: M4() },
//       u_projection: { kind: U.MAT4, value: M4() }
//     },
//     attributes: {
//       a_coord: { kind: A.FLOAT, value: geometry.val.vertices, size: 3 },
//       a_normal: { kind: A.FLOAT, value: geometry.val.normals, size: 3 }
//     }
//   })
//   const entities = [{
//     position: V3(0, 0, 0),
//     scale: V3(1, 1, 1),
//     rotation: V3(0, 0, 0),
//     model: M4()
//   }]
// 
//   requestAnimationFrame(function render () {
//     for ( const entity of entities ) {
//       entity.rotation[1] += 0.02
//       identity(entity.model)
//       translate(entity.model, entity.position)
//       scale(entity.model, entity.scale)
//       rotateX(entity.model, entity.rotation[0])
//       rotateY(entity.model, entity.rotation[1])
//       rotateZ(entity.model, entity.rotation[2])
//     }
// 
//     cam.aspectRatio = c.width / c.height
//     lookAt(cam.view, cam.position, cam.at, cam.up)
//     perspective(cam.projection, cam.vfov, cam.aspectRatio, cam.near, cam.far)
// 
//     gl.viewport(0, 0, c.width, c.height)
//     gl.clearColor(0, 0, 0, 0)
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
// 
//     for ( const entity of entities ) {
//       if ( command.success ) run(gl, command.value, { 
//         count: 12,
//         uniforms: {
//           u_light: light,
//           u_model: entity.model,
//           u_view: cam.view,
//           u_projection: cam.projection
//         },
//         attributes: {}
//       })
//     }
//     requestAnimationFrame(render)
//   })
// })
