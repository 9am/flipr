<div align="center">
    <img alt="flipr" src="https://user-images.githubusercontent.com/1435457/230853123-9dbcfde7-1214-4ef9-bdf8-b7ebab147ec7.svg" width="240" />
    <h1>@9am/flipr</h1>
    <p><a href="https://github.com/9am/9am.github.io/issues/11">A flipping book library. 📖</a></p>
    <p>
        <a href="https://github.com/9am/flipr/blob/main/LICENSE">
            <img alt="GitHub" src="https://img.shields.io/github/license/9am/flipr?style=flat-square&color=success">
        </a>
        <a href="https://www.npmjs.com/package/@9am/flipr">
            <img alt="npm" src="https://img.shields.io/npm/v/@9am/flipr?style=flat-square&color=orange">
        </a>
        <a href="https://www.npmjs.com/package/@9am/flipr">
            <img alt="npm" src="https://img.shields.io/npm/dt/@9am/flipr?style=flat-square&color=blue">
        </a>
        <a href="https://bundlephobia.com/package/@9am/flipr@latest">
            <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@9am/flipr?style=flat-square">
        </a>
    </p>
</div>

---

## Demo
<img alt="flipr-ss" src="https://user-images.githubusercontent.com/1435457/229063596-852e54f1-0af8-4446-8569-14580116377a.gif" width="400" />

[![Edit random-image](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/random-image-xrnrfn?fontsize=14&hidenavigation=1&module=%2Fsrc%2Findex.js&theme=light)

## Features
- Create a flipping book from **html content**.
- Support **horizontal or vertial** layout.

## Usage

#### Install
```bash
npm install @9am/flipr
```

#### HTML
```html
<ol id="content">
    <li>1111111111</li>
    <li>2222222222</li>
    <li>3333333333</li>
    <li>4444444444</li>
</ol>
```

#### Javascript
```js
import Flipr from '@9am/flipr';
import '@9am/flipr/style.css';

const flipr = new Flipr({
    /* FliprOptions */
    w: 600,
    h: 400,
    content: document.querySelector('#content'),
    tHint: 'tr',
});

// append dom
document.body.appendChild(flipr.dom);
```

## Documentation

### FliprOptions

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `w` | `number` | **required\*** | book width |
| `h` | `number` | **required\*** | book height |
| `content` | `HTMLElement` | **required\*** | the content element whose children will be used to render book |
| `ph` | `number` | 0 | book padding horizontal |
| `pv` | `number` | 0 | book padding vertical |
| `align` | `'horizontal' \| 'vertical'` | 'horizontal' | book layout |
| `pageNum` | `number` | 0 | default page num |
| `tSize` | `number` | 100 | trigger area size |
| `tHint` | `'tl' \| 'tr' \| 'bl' \| 'br' \| ''` | '' | show hint trigger area before user interaction |
| `tHintInterval` | `number` | 1000 | hint animation interval in ms |

### CSS Properties
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `--flipr-padding` | `css <padding>` | 20px | page padding |
| `--flipr-bg` | `css <background>` | white | page background |

## License
[MIT](LICENSE)
