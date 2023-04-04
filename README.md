<div align="center">
    <img alt="flipr" src="https://user-images.githubusercontent.com/1435457/229013561-28217a1c-5f36-48de-8af6-616aebe7a8dc.svg" width="240" />
    <h1>@9am/flipr</h1>
    <p>A flipping book library. 📖</p>
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

#### Javascript
```js
import Flipr from '@9am/flipr';
import '@9am/flipr/style.css';

// prepare contents
const content = Array.from({ length: 6}).reduce((memo, _, index) => {
    const item = document.createElement('p');
    item.textContent = Array.from({ length: 440 }).map(() => index).join(' ');
    memo.appendChild(item);
    return memo;
}, document.createElement('div'));

// init
const flipr = new Flipr({
    /* FliprOptions */
    w: 600,
    h: 400,
    content,
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
| `tSize` | `number` | 100 | trigger area size |
| `pageNum` | `number` | 0 | default page num |
| `tHint` | `'tl' \| 'tr' \| 'bl' \| 'br'` | undefined | show hint trigger area before user interaction |

### CSS properties
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `--flipr-padding` | `css <padding>` | 20px | page padding |
| `--flipr-bg` | `css <background>` | white | page background |

## License
[MIT](LICENSE)
