export function loadBinary ( uri: string ): Promise<ArrayBuffer> {
  return new Promise(function (res, rej) {
    const xhr = new XMLHttpRequest

    xhr.responseType = 'arraybuffer'
    xhr.onload = _ => res(xhr.response)
    xhr.onerror = _ => rej(`Could not load ${ uri }`)
    xhr.open('GET', uri)
    xhr.send()
  })
}

export function loadString ( uri: string ): Promise<string> {
  return new Promise(function (res, rej) {
    const xhr = new XMLHttpRequest

    xhr.onload = _ => res(xhr.response)
    xhr.onerror = _ => rej(`Could not load ${ uri }`)
    xhr.open('GET', uri)
    xhr.send()
  })
}

export function loadImage ( uri: string ): Promise<HTMLImageElement> {
  return new Promise(function ( res, rej ) {
    const i = new Image

    i.src = uri
    i.onload = _ => res(i)
    i.onerror = rej
  })
}
