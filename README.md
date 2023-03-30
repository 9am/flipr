<div align="center">
    <img alt="flipr" src="https://user-images.githubusercontent.com/1435457/228783226-401a3e1a-f2eb-46d1-b499-7ee6f7637e0c.svg" width="240" />
    <h1>@9m/flipr</h1>
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

// prepare some contents
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
});
// append dom
document.body.appendChild(flipr.dom);
```

## Documentation

### FliprOptions

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `w` | number | **required** | width |
| `h` | number | **required** | height |
| `content` | HTMLElement | **required** | the content element whose children will be used to render book |
| `ph` | number | 0 | padding horizontal |
| `pv` | number | 0 | padding vertical |
| `tSize` | number | 100 | trigger area size |
| `align` | horizontal \| vertical | horizontal | align |
| `pageNum` | number | 0 | default page num |

## License
[MIT](LICENSE)
