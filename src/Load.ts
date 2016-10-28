export function loadXHR (uri: string): Promise<string> {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest

    xhr.onload = _ => res(xhr.response)
    xhr.onerror = _ => rej(`Could not load ${ uri }`)
    xhr.open('GET', uri)
    xhr.send()
  })
}
