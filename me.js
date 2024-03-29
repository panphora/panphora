function domReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

domReady(() => {
document.body.insertAdjacentHTML("beforeend", `
<style>
  .me-pop, .me-pop * {
    font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif !important;
    box-sizing: border-box !important;
    font-size: 14px !important;
    line-height: 1 !important;
    color: #fff !important;
  }
  .me-pop {
    z-index: 100;
    position: fixed;
    right: 0;
    bottom: 0;
    padding: 6px 8px 9px 8px !important;
    border-top: 1px solid transparent;
    border-left: 1px solid transparent;
    border-top-left-radius: 14px;
    background: #000;
    text-decoration: none;
    transition: none;
  }
  .me-pop:hover {
    border-top: 1px solid #000;
    border-left: 1px solid #000;
    background: #F456BB;
    transition: none;
  }
  .me-pop img {
    display: inline !important;
    border-radius: 100%;
    width: 22px !important;
    vertical-align: middle !important;
  }
  .me-pop p {
    position: relative;
    top: -1px;
    margin: 0 0 0 6px;
    vertical-align: middle;
    display: inline;
    font-weight: 500;
    font-size: 14px !important;
  }
</style>
<a class="me-pop" target="_blank" rel="noopener" href="https://panphora.com/">
  <img src="data:image/png;base64,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" /><p>panphora</p>
</a>
`);
});