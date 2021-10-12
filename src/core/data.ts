export const s = `
# 搭建一个高效的开发环境

**欢迎补充**

## 替换终端

iTerm 比自带的终端更好用，可以更方便的管理终端窗口，可以在任何呼出一个快捷的终端窗口（配置方式 Keys -> HotKey -> Create a Dedicated Hotkey Window）等等

## 替换 shell

### 推荐1：zsh + on-my-zsh

\`\`\`
# 更改默认的 shell 为 zsh

chsh -s /bin/zsh

# 安装 on my zsh

sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
\`\`\`

\`on-my-zsh\` 是一个帮助你配置 zsh 的工具，有了它可以方便地安装插件、进行各种配置…

推荐几个必装插件：

**z**

https://github.com/agkozak/zsh-z

可以快速在目录之间进行转跳

**zsh-autosuggestions**

在你打命令的时候直接给你显示之前打过的命令，可以快速选中命令

**zsh-syntax-highlighting**

高亮命令

### 推荐2：fish shell

https://fishshell.com/

速度快，功能齐全（自动补全、高亮等等），开箱即用，但是和 bash 不兼容（有解决方式），我之前用过，好像是因为一些兼容问题去用 zsh，不知道目前 fish shell 的现状如何，但是值得用用看

对一些常用命令定义 alias（编辑对应的 shell 配置 如 \`~/.zshrc\`），比如：

\`\`\`
alias nr="npm run"

alias gc="git checkout"

alias gcb="git checkout -b"

alias gp="git push"

alias gs="git status"

alias gaa="git add ."

alias gpl="git pull"
\`\`\`

一些命令的替代品：

ls -> lsd

cat -> bat

curl -> httpie（还有 https://github.com/rs/curlie）

…

## 更好用的vim

虽然我不怎么用vim，但是偶尔会用 vim 修改一下文件，查看一下文件之类的，neovim 比自带的好用很多

neovim https://github.com/neovim/neovim

## 更好用的 nodejs

开发中会涉及到使用不同的 nodejs 版本，可以使用 nvm 来管理多个版本的 nodejshttps://github.com/nvm-sh/nvm

对于 windows 用户，可以用 https://github.com/coreybutler/nvm-windows 或者 https://github.com/jasongin/nvs（跨平台）

我没有仔细比较过这几个工具，不过应该差不多

## 创建自己的 dotfiles

当你配置了一系列东西之后，你最终可以拥有自己的一个 dotfiles（你可以把它上传到 github 上），当你拥有一台新电脑的时候，你可以执行这个 dotfiles，就可以获取熟悉的环境

https://dotfiles.github.io/

## 好用的抓包工具

用 whistle！比 Charles 更简单易用方便配置，我之前写的一个介绍：https://zhuscat.com/posts/https-proxy-on-ios/

## VSCode 的一些方便使用但你不一定知道的东西

\`Control + Tab\`：浏览最近打开的文件

\`Command + P\`：直接打文件名可以快速搜索文件（不用精准地输入路径，可以跳着输入）

\`Command + P\` 然后输入 \`@\`，可以查看当前文件的 Symbol

\`Command + P\` 然后输入 \`#\`，可以搜索整个项目的 Symbol

## 一些好用的软件

### Magnet（macOS Windows也不需要）

快速进行窗口管理

### Sip

颜色吸取，前端必备

### Alfred

更好用的 Spotlight（定义 snippet、查看剪切板历史...）
`
