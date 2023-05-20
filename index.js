//思源笔记折腾记录-快速开关代码片段
//http://127.0.0.1:55484/stage/build/desktop/?r=r4eq8ar&&blockID=20230426000214-g9ic2p1
//siyuan://blocks/20230426000214-g9ic2p1
//之前我们已经弄了在笔记内以文档的形式写代码片段的活儿了，但是这些代码片段还是要去设置界面才能开关，有点不大方便，所以这回来整个新的活，让它们更方便开关一点点。
//首先还是要引入依赖，这回因为需要工具栏和保存代码片段，所以我们需要这两个东西
const { Plugin } = require("siyuan");
const clientApi = require("siyuan");
let 核心api
class quickSnippets extends Plugin {
  onload() {
    this.selfURL = `/plugins/${this.constructor.name}`;

    this.topBarElement = this.addTopBar({
      icon: "iconCode",
      title: this.i18n.addTopBarIcon,
      position: "right",
      callback: this.点击回调函数,
    });
  }
  onunload(){
    this.topBarElement.remove()
  }
  点击回调函数 = async (event) => {
    const menu = new clientApi.Menu("topBarSample", () => {
        
    });
    核心api =(await import(`${this.selfURL}/pollyfills/kernelApi.js`))['default']
    const rect = this.topBarElement.getBoundingClientRect();
    let 当前代码片段 = await 核心api.getSnippet({ type: "all", enabled: 2 });
    let 旧代码片段 = JSON.parse(JSON.stringify(当前代码片段));
    当前代码片段.snippets.forEach((item) => {
      if (item.id) {
        let element = document.createElement("button");
        element.setAttribute("class", "b3-menu__item");
        let spanText;
        let id;
        let type;

        if (!item.id.endsWith("css") && !item.id.endsWith("js")) {
          id = item.id;
          type = item.type == "css" ? "css" : " js";
          spanText = `<div style="font-size:85%;color:var(--b3-theme-on-surface);width:60px;display:inline-block">${type}</div> 
                 ${item.name}`;
        } else {
          if (item.id.endsWith("css")) {
            id = item.id.slice(0, item.id.length - 3);
            type = "cssInNote";
          } else {
            id = item.id.slice(0, item.id.length - 2);
            type = "jsInNote";
          }
          let href;
          if (window.require) {
            href = `siyuan://blocks/${id}'>${item.name}`;
          } else {
            href = `${window.location.href
              .split("?")[0]
              .replace(
                "/stage/build/app/",
                "/stage/build/desktop/"
              )}?id=${id}`;
          }
          spanText = `<div style="font-size:85%;color:var(--b3-theme-on-surface);width:60px;display:inline-block">${type}</div>
                  <a href='${href}'>${item.name}</a>`;
        }

        element.innerHTML = `
                          <div class="fn__flex-1">
        <span class="fn__space"></span>
                          ${spanText}
                          </div>
                          <span class="fn__space"></span>
                              <input style="box-sizing: border-box"  class="b3-switch fn__flex-center"  type="checkbox" ${
                                item.enabled ? "checked" : ""
                              }>
                          `;
        element.setAttribute("data-type", type);
        element.setAttribute("data-id", id);
        //挂上事件，让菜单项里面的开关可以点击
        element.addEventListener(
          "click",
          (event) => {
            if (event.target.tagName !== "INPUT") {
              return;
            }
            item.enabled = !item.enabled;
            element.querySelector("input").value = item.enabled;
            element
              .querySelector("input")
              .setAttribute("checked", item.enabled);
            event.stopPropagation();
          },
          false
        );
        window.siyuan.menus.menu.append(element);
      }
    });
    //这个方法是思源自带的
    menu.open({
      x: rect.left,
      y: rect.bottom,
    });
    //啊这里就是判断要不要重载了
    let cb = async (e) => {
      let target = e.target;
      //如果不是在菜单里面的话
      if (!isMenuClicked(target)) {
        if (JSON.stringify(当前代码片段) !== JSON.stringify(旧代码片段)) {
          await 核心api.setSnippet(当前代码片段);
          
          window.location.reload();
        } else {
          window.removeEventListener("click", cb);
        }
      }
    };
    window.addEventListener("click", cb);
  };
  //
}
module.exports = quickSnippets;

//这里用到了一个​​isMenuClicked​​的工具函数
function isMenuClicked(element) {
  if (element.parentElement) {
    if (element.parentElement !== window.siyuan.menus.menu.element) {
      return isMenuClicked(element.parentElement);
    } else {
      return true;
    }
  } else {
    return false;
  }
}
