import Vue from 'vue'

Vue.prototype.$btoa = (text) => {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return window.btoa(binary)
}

Vue.prototype.$atob = (base64) => {
  const binary = window.atob(base64)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
