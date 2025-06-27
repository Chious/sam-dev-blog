---
title: 'WebGL'
tags: ['WebGL']
sidebar_label: 'WebGL'
sidebar_position: 1
---

## Open GL

> OpenGL 是一個跨平台的 API，用來渲染 2D 和 3D 圖形。

## GLSL

> GLSL 是 OpenGL 的語言，用來編寫 shader，利用 GPU 來加速運算。

```
uniform vec3 u_color;
attribute vec4 a_position;

void main() {
  gl_Position = a_position;
}
```

In Javascript

```javascript
const fragmentShader = `
  precision mediump float;
  uniform vec3 u_color;
  void main() {
    gl_FragColor = vec4(u_color, 1.0);
  }
`;
```

## WebGL

> WebGL 是基於 OpenGL ES 2.0 的 API，用來在瀏覽器上渲染 2D 和 3D 圖形。

```javascript
const canvas = document.createElement('canvas');

const gl = canvas.getContext('webgl');

if (!gl) {
  throw new Error('WebGL not supported');
}

const vertexShader = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;
```
