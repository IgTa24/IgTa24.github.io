const btf = {
  debounce: function (func, wait, immediate) {
    let timeout
    return function () {
      const context = this
      const args = arguments
      const later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  },

  throttle: function (func, wait, options) {
    let timeout, context, args
    let previous = 0
    if (!options) options = {}

    const later = function () {
      previous = options.leading === false ? 0 : new Date().getTime()
      timeout = null
      func.apply(context, args)
      if (!timeout) context = args = null
    }

    const throttled = function () {
      const now = new Date().getTime()
      if (!previous && options.leading === false) previous = now
      const remaining = wait - (now - previous)
      context = this
      args = arguments
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        previous = now
        func.apply(context, args)
        if (!timeout) context = args = null
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining)
      }
    }

    return throttled
  },

  sidebarPaddingR: () => {
    const innerWidth = window.innerWidth
    const clientWidth = document.body.clientWidth
    const paddingRight = innerWidth - clientWidth
    if (innerWidth !== clientWidth) {
      document.body.style.paddingRight = paddingRight + 'px'
    }
  },

  snackbarShow: (text, showAction = false, duration = 2000) => {
    const { position, bgLight, bgDark } = GLOBAL_CONFIG.Snackbar
    const bg = document.documentElement.getAttribute('data-theme') === 'light' ? bgLight : bgDark
    Snackbar.show({
      text: text,
      backgroundColor: bg,
      showAction: showAction,
      duration: duration,
      pos: position,
      customClass: 'snackbar-css'
    })
  },

  diffDate: (d, more = false) => {
    const dateNow = new Date()
    const datePost = new Date(d)
    const dateDiff = dateNow.getTime() - datePost.getTime()
    const minute = 1000 * 60
    const hour = minute * 60
    const day = hour * 24
    const month = day * 30

    let result
    if (more) {
      const monthCount = dateDiff / month
      const dayCount = dateDiff / day
      const hourCount = dateDiff / hour
      const minuteCount = dateDiff / minute

      if (monthCount > 12) {
        result = datePost.toLocaleDateString().replace(/\//g, '-')
      } else if (monthCount >= 1) {
        result = parseInt(monthCount) + ' ' + GLOBAL_CONFIG.date_suffix.month
      } else if (dayCount >= 1) {
        result = parseInt(dayCount) + ' ' + GLOBAL_CONFIG.date_suffix.day
      } else if (hourCount >= 1) {
        result = parseInt(hourCount) + ' ' + GLOBAL_CONFIG.date_suffix.hour
      } else if (minuteCount >= 1) {
        result = parseInt(minuteCount) + ' ' + GLOBAL_CONFIG.date_suffix.min
      } else {
        result = GLOBAL_CONFIG.date_suffix.just
      }
    } else {
      result = parseInt(dateDiff / day)
    }
    return result
  },

  loadComment: (dom, callback) => {
    if ('IntersectionObserver' in window) {
      const observerItem = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback()
          observerItem.disconnect()
        }
      }, { threshold: [0] })
      observerItem.observe(dom)
    } else {
      callback()
    }
  },

  scrollToDest: (pos, time = 500) => {
    const currentPos = window.pageYOffset
    if (currentPos > pos) pos = pos - 70

    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: pos,
        behavior: 'smooth'
      })
      return
    }

    let start = null
    pos = +pos
    window.requestAnimationFrame(function step (currentTime) {
      start = !start ? currentTime : start
      const progress = currentTime - start
      if (currentPos < pos) {
        window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos)
      } else {
        window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time))
      }
      if (progress < time) {
        window.requestAnimationFrame(step)
      } else {
        window.scrollTo(0, pos)
      }
    })
  },

  animateIn: (ele, text) => {
    ele.style.display = 'block'
    ele.style.animation = text
  },

  animateOut: (ele, text) => {
    ele.addEventListener('animationend', function f () {
      ele.style.display = ''
      ele.style.animation = ''
      ele.removeEventListener('animationend', f)
    })
    ele.style.animation = text
  },

  getParents: (elem, selector) => {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem
    }
    return null
  },

  siblings: (ele, selector) => {
    return [...ele.parentNode.children].filter((child) => {
      if (selector) {
        return child !== ele && child.matches(selector)
      }
      return child !== ele
    })
  },

  
  wrap: (selector, eleType, options) => {
    const creatEle = document.createElement(eleType)
    for (const [key, value] of Object.entries(options)) {
      creatEle.setAttribute(key, value)
    }
    selector.parentNode.insertBefore(creatEle, selector)
    creatEle.appendChild(selector)
  },

  unwrap: el => {
    const elParentNode = el.parentNode
    if (elParentNode !== document.body) {
      elParentNode.parentNode.insertBefore(el, elParentNode)
      elParentNode.parentNode.removeChild(elParentNode)
    }
  },

  isHidden: ele => ele.offsetHeight === 0 && ele.offsetWidth === 0,

  getEleTop: ele => {
    let actualTop = ele.offsetTop
    let current = ele.offsetParent

    while (current !== null) {
      actualTop += current.offsetTop
      current = current.offsetParent
    }

    return actualTop
  },

  loadLightbox: ele => {
    const service = GLOBAL_CONFIG.lightbox

    if (service === 'mediumZoom') {
      const zoom = mediumZoom(ele)
      zoom.on('open', e => {
        const photoBg = document.documentElement.getAttribute('data-theme') === 'dark' ? '#121212' : '#fff'
        zoom.update({
          background: photoBg
        })
      })
    }

    if (service === 'fancybox') {
      ele.forEach(i => {
        if (i.parentNode.tagName !== 'A') {
          const dataSrc = i.dataset.lazySrc || i.src
          const dataCaption = i.title || i.alt || ''
          btf.wrap(i, 'a', { href: dataSrc, 'data-fancybox': 'gallery', 'data-caption': dataCaption, 'data-thumb': dataSrc })
        }
      })

      if (!window.fancyboxRun) {
        Fancybox.bind('[data-fancybox]', {
          Hash: false,
          Thumbs: {
            autoStart: false
          }
        })
        window.fancyboxRun = true
      }
    }
  },

  initJustifiedGallery: function (selector) {
    selector.forEach(function (i) {
      if (!btf.isHidden(i)) {
        fjGallery(i, {
          itemSelector: '.fj-gallery-item',
          rowHeight: 220,
          gutter: 4,
          onJustify: function () {
            this.$container.style.opacity = '1'
          }
        })
      }
    })
  },

  updateAnchor: (anchor) => {
    if (anchor !== window.location.hash) {
      if (!anchor) anchor = location.pathname
      const title = GLOBAL_CONFIG_SITE.title
      window.history.replaceState({
        url: location.href,
        title: title
      }, title, anchor)
    }
  }
};document.addEventListener('DOMContentLoaded', function () {
  let blogNameWidth, menusWidth, searchWidth, $nav
  let mobileSidebarOpen = false

  const adjustMenu = (init) => {
    if (init) {
      blogNameWidth = document.getElementById('site-name').offsetWidth
      const $menusEle = document.querySelectorAll('#menus .menus_item')
      menusWidth = 0
      $menusEle.length && $menusEle.forEach(i => { menusWidth += i.offsetWidth })
      const $searchEle = document.querySelector('#search-button')
      searchWidth = $searchEle ? $searchEle.offsetWidth : 0
      $nav = document.getElementById('nav')
    }

    let hideMenuIndex = ''
    if (window.innerWidth <= 768) hideMenuIndex = true
    else hideMenuIndex = blogNameWidth + menusWidth + searchWidth > $nav.offsetWidth - 120

    if (hideMenuIndex) {
      $nav.classList.add('hide-menu')
    } else {
      $nav.classList.remove('hide-menu')
    }
  }

  // 初始化header
  const initAdjust = () => {
    adjustMenu(true)
    $nav.classList.add('show')
  }

  // sidebar menus
  const sidebarFn = {
    open: () => {
      btf.sidebarPaddingR()
      document.body.style.overflow = 'hidden'
      btf.animateIn(document.getElementById('menu-mask'), 'to_show 0.5s')
      document.getElementById('sidebar-menus').classList.add('open')
      mobileSidebarOpen = true
    },
    close: () => {
      const $body = document.body
      $body.style.overflow = ''
      $body.style.paddingRight = ''
      btf.animateOut(document.getElementById('menu-mask'), 'to_hide 0.5s')
      document.getElementById('sidebar-menus').classList.remove('open')
      mobileSidebarOpen = false
    }
  }

  
  const scrollDownInIndex = () => {
    const $scrollDownEle = document.getElementById('scroll-down')
    $scrollDownEle && $scrollDownEle.addEventListener('click', function () {
      btf.scrollToDest(document.getElementById('content-inner').offsetTop, 300)
    })
  }

  
  const addHighlightTool = function () {
    const highLight = GLOBAL_CONFIG.highlight
    if (!highLight) return

    const isHighlightCopy = highLight.highlightCopy
    const isHighlightLang = highLight.highlightLang
    const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink
    const highlightHeightLimit = highLight.highlightHeightLimit
    const isShowTool = isHighlightCopy || isHighlightLang || isHighlightShrink !== undefined
    const $figureHighlight = highLight.plugin === 'highlighjs' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')

    if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return

    const isPrismjs = highLight.plugin === 'prismjs'

    let highlightShrinkEle = ''
    let highlightCopyEle = ''
    const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''

    if (isHighlightShrink !== undefined) {
      highlightShrinkEle = `<i class="fas fa-angle-down expand ${highlightShrinkClass}"></i>`
    }

    if (isHighlightCopy) {
      highlightCopyEle = '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>'
    }

    const copy = (text, ctx) => {
      if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        document.execCommand('copy')
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          btf.snackbarShow(GLOBAL_CONFIG.copy.success)
        } else {
          const prevEle = ctx.previousElementSibling
          prevEle.innerText = GLOBAL_CONFIG.copy.success
          prevEle.style.opacity = 1
          setTimeout(() => { prevEle.style.opacity = 0 }, 700)
        }
      } else {
        if (GLOBAL_CONFIG.Snackbar !== undefined) {
          btf.snackbarShow(GLOBAL_CONFIG.copy.noSupport)
        } else {
          ctx.previousElementSibling.innerText = GLOBAL_CONFIG.copy.noSupport
        }
      }
    }

    // click events
    const highlightCopyFn = (ele) => {
      const $buttonParent = ele.parentNode
      $buttonParent.classList.add('copy-true')
      const selection = window.getSelection()
      const range = document.createRange()
      if (isPrismjs) range.selectNodeContents($buttonParent.querySelectorAll('pre code')[0])
      else range.selectNodeContents($buttonParent.querySelectorAll('table .code pre')[0])
      selection.removeAllRanges()
      selection.addRange(range)
      const text = selection.toString()
      copy(text, ele.lastChild)
      selection.removeAllRanges()
      $buttonParent.classList.remove('copy-true')
    }

    const highlightShrinkFn = (ele) => {
      const $nextEle = [...ele.parentNode.children].slice(1)
      ele.firstChild.classList.toggle('closed')
      if (btf.isHidden($nextEle[$nextEle.length - 1])) {
        $nextEle.forEach(e => { e.style.display = 'block' })
      } else {
        $nextEle.forEach(e => { e.style.display = 'none' })
      }
    }

    const highlightToolsFn = function (e) {
      const $target = e.target.classList
      if ($target.contains('expand')) highlightShrinkFn(this)
      else if ($target.contains('copy-button')) highlightCopyFn(this)
    }

    const expandCode = function () {
      this.classList.toggle('expand-done')
    }

    function createEle (lang, item, service) {
      const fragment = document.createDocumentFragment()

      if (isShowTool) {
        const hlTools = document.createElement('div')
        hlTools.className = `highlight-tools ${highlightShrinkClass}`
        hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle
        hlTools.addEventListener('click', highlightToolsFn)
        fragment.appendChild(hlTools)
      }

      if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
        const ele = document.createElement('div')
        ele.className = 'code-expand-btn'
        ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
        ele.addEventListener('click', expandCode)
        fragment.appendChild(ele)
      }

      if (service === 'hl') {
        item.insertBefore(fragment, item.firstChild)
      } else {
        item.parentNode.insertBefore(fragment, item)
      }
    }

    if (isHighlightLang) {
      if (isPrismjs) {
        $figureHighlight.forEach(function (item) {
          const langName = item.getAttribute('data-language') ? item.getAttribute('data-language') : 'Code'
          const highlightLangEle = `<div class="code-lang">${langName}</div>`
          btf.wrap(item, 'figure', { class: 'highlight' })
          createEle(highlightLangEle, item)
        })
      } else {
        $figureHighlight.forEach(function (item) {
          let langName = item.getAttribute('class').split(' ')[1]
          if (langName === 'plain' || langName === undefined) langName = 'Code'
          const highlightLangEle = `<div class="code-lang">${langName}</div>`
          createEle(highlightLangEle, item, 'hl')
        })
      }
    } else {
      if (isPrismjs) {
        $figureHighlight.forEach(function (item) {
          btf.wrap(item, 'figure', { class: 'highlight' })
          createEle('', item)
        })
      } else {
        $figureHighlight.forEach(function (item) {
          createEle('', item, 'hl')
        })
      }
    }
  }

  
  function addPhotoFigcaption () {
    document.querySelectorAll('#article-container img').forEach(function (item) {
      const parentEle = item.parentNode
      const altValue = item.title || item.alt
      if (altValue && !parentEle.parentNode.classList.contains('justified-gallery')) {
        const ele = document.createElement('div')
        ele.className = 'img-alt is-center'
        ele.textContent = altValue
        parentEle.insertBefore(ele, item.nextSibling)
      }
    })
  }

  
  const runLightbox = () => {
    btf.loadLightbox(document.querySelectorAll('#article-container img:not(.no-lightbox)'))
  }

  
  const runJustifiedGallery = function (ele) {
    ele.forEach(item => {
      const $imgList = item.querySelectorAll('img')

      $imgList.forEach(i => {
        const dataLazySrc = i.getAttribute('data-lazy-src')
        if (dataLazySrc) i.src = dataLazySrc
        btf.wrap(i, 'div', { class: 'fj-gallery-item' })
      })
    })

    if (window.fjGallery) {
      setTimeout(() => { btf.initJustifiedGallery(ele) }, 100)
      return
    }

    const newEle = document.createElement('link')
    newEle.rel = 'stylesheet'
    newEle.href = GLOBAL_CONFIG.source.justifiedGallery.css
    document.body.appendChild(newEle)
    getScript(`${GLOBAL_CONFIG.source.justifiedGallery.js}`).then(() => { btf.initJustifiedGallery(ele) })
  }

  
  const scrollFn = function () {
    const $rightside = document.getElementById('rightside')
    const innerHeight = window.innerHeight + 56

    // 當滾動條小于 56 的時候
    if (document.body.scrollHeight <= innerHeight) {
      $rightside.style.cssText = 'opacity: 1; transform: translateX(-58px)'
      return
    }

    // find the scroll direction
    function scrollDirection (currentTop) {
      const result = currentTop > initTop // true is down & false is up
      initTop = currentTop
      return result
    }

    let initTop = 0
    let isChatShow = true
    const $header = document.getElementById('page-header')
    const isChatBtnHide = typeof chatBtnHide === 'function'
    const isChatBtnShow = typeof chatBtnShow === 'function'

    const scrollTask = btf.throttle(() => {
        const currentTop = window.scrollY || document.documentElement.scrollTop
        const isDown = scrollDirection(currentTop)
        if (currentTop > 56) {
          if (isDown) {
            if ($header.classList.contains('nav-visible')) $header.classList.remove('nav-visible')
            if (isChatBtnShow && isChatShow === true) {
              chatBtnHide()
              isChatShow = false
            }
          } else {
            if (!$header.classList.contains('nav-visible')) $header.classList.add('nav-visible')
            if (isChatBtnHide && isChatShow === false) {
              chatBtnShow()
              isChatShow = true
            }
          }
          $header.classList.add('nav-fixed')
          if (window.getComputedStyle($rightside).getPropertyValue('opacity') === '0') {
            $rightside.style.cssText = 'opacity: 0.8; transform: translateX(-58px)'
          }
        } else {
          if (currentTop === 0) {
            $header.classList.remove('nav-fixed', 'nav-visible')
          }
          $rightside.style.cssText = "opacity: ''; transform: ''"
        }

        if (document.body.scrollHeight <= innerHeight) {
          $rightside.style.cssText = 'opacity: 0.8; transform: translateX(-58px)'
        }
      }, 200)
    
    window.scrollCollect = scrollTask

    window.addEventListener('scroll', scrollCollect)
  }

  
  const scrollFnToDo = function () {
    const isToc = GLOBAL_CONFIG_SITE.isToc
    const isAnchor = GLOBAL_CONFIG.isAnchor
    const $article = document.getElementById('article-container')

    if (!($article && (isToc || isAnchor))) return

    let $tocLink, $cardToc, scrollPercent, autoScrollToc, isExpand

    if (isToc) {
      const $cardTocLayout = document.getElementById('card-toc')
      $cardToc = $cardTocLayout.getElementsByClassName('toc-content')[0]
      $tocLink = $cardToc.querySelectorAll('.toc-link')
      const $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
      isExpand = $cardToc.classList.contains('is-expand')

      scrollPercent = currentTop => {
        const docHeight = $article.clientHeight
        const winHeight = document.documentElement.clientHeight
        const headerHeight = $article.offsetTop
        const contentMath = (docHeight > winHeight) ? (docHeight - winHeight) : (document.documentElement.scrollHeight - winHeight)
        const scrollPercent = (currentTop - headerHeight) / (contentMath)
        const scrollPercentRounded = Math.round(scrollPercent * 100)
        const percentage = (scrollPercentRounded > 100) ? 100 : (scrollPercentRounded <= 0) ? 0 : scrollPercentRounded
        $tocPercentage.textContent = percentage
      }

      window.mobileToc = {
        open: () => {
          $cardTocLayout.style.cssText = 'animation: toc-open .3s; opacity: 1; right: 55px'
        },

        close: () => {
          $cardTocLayout.style.animation = 'toc-close .2s'
          setTimeout(() => {
            $cardTocLayout.style.cssText = "opacity:''; animation: ''; right: ''"
          }, 100)
        }
      }

      // toc元素點擊
      $cardToc.addEventListener('click', e => {
        e.preventDefault()
        const target = e.target.classList
        if (target.contains('toc-content')) return
        const $target = target.contains('toc-link')
          ? e.target
          : e.target.parentElement
        btf.scrollToDest(btf.getEleTop(document.getElementById(decodeURI($target.getAttribute('href')).replace('#', ''))), 300)
        if (window.innerWidth < 900) {
          window.mobileToc.close()
        }
      })

      autoScrollToc = item => {
        const activePosition = item.getBoundingClientRect().top
        const sidebarScrollTop = $cardToc.scrollTop
        if (activePosition > (document.documentElement.clientHeight - 100)) {
          $cardToc.scrollTop = sidebarScrollTop + 150
        }
        if (activePosition < 100) {
          $cardToc.scrollTop = sidebarScrollTop - 150
        }
      }
    }

    // find head position & add active class
    const list = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
    let detectItem = ''
    const findHeadPosition = function (top) {
      if (top === 0) {
        return false
      }

      let currentId = ''
      let currentIndex = ''

      list.forEach(function (ele, index) {
        if (top > btf.getEleTop(ele) - 80) {
          const id = ele.id
          currentId = id ? '#' + encodeURI(id) : ''
          currentIndex = index
        }
      })

      if (detectItem === currentIndex) return

      if (isAnchor) btf.updateAnchor(currentId)

      detectItem = currentIndex

      if (isToc) {
        $cardToc.querySelectorAll('.active').forEach(i => { i.classList.remove('active') })

        if (currentId === '') {
          return
        }

        const currentActive = $tocLink[currentIndex]
        currentActive.classList.add('active')

        setTimeout(() => {
          autoScrollToc(currentActive)
        }, 0)

        if (isExpand) return
        let parent = currentActive.parentNode

        for (; !parent.matches('.toc'); parent = parent.parentNode) {
          if (parent.matches('li')) parent.classList.add('active')
        }
      }
    }

    // main of scroll
    window.tocScrollFn = function () {
      return btf.throttle(function () {
        const currentTop = window.scrollY || document.documentElement.scrollTop
        isToc && scrollPercent(currentTop)
        findHeadPosition(currentTop)
      }, 100)()
    }
    window.addEventListener('scroll', tocScrollFn)
  }

  
  const rightSideFn = {
    switchReadMode: () => { // read-mode
      const $body = document.body
      $body.classList.add('read-mode')
      const newEle = document.createElement('button')
      newEle.type = 'button'
      newEle.className = 'fas fa-sign-out-alt exit-readmode'
      $body.appendChild(newEle)

      function clickFn () {
        $body.classList.remove('read-mode')
        newEle.remove()
        newEle.removeEventListener('click', clickFn)
      }

      newEle.addEventListener('click', clickFn)
    },
    switchDarkMode: () => { // Switch Between Light And Dark Mode
      const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      if (nowMode === 'light') {
        activateDarkMode()
        saveToLocal.set('theme', 'dark', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
      } else {
        activateLightMode()
        saveToLocal.set('theme', 'light', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
      }
      // handle some cases
      typeof utterancesTheme === 'function' && utterancesTheme()
      typeof changeGiscusTheme === 'function' && changeGiscusTheme()
      typeof FB === 'object' && window.loadFBComment && window.loadFBComment()
      typeof runMermaid === 'function' && window.runMermaid()
    },
    showOrHideBtn: (e) => { // rightside 點擊設置 按鈕 展開
      const rightsideHideClassList = document.getElementById('rightside-config-hide').classList
      rightsideHideClassList.toggle('show')
      if (e.classList.contains('show')) {
        rightsideHideClassList.add('status')
        setTimeout(() => {
          rightsideHideClassList.remove('status')
        }, 300)
      }
      e.classList.toggle('show')
    },
    scrollToTop: () => { // Back to top
      btf.scrollToDest(0, 500)
    },
    hideAsideBtn: () => { // Hide aside
      const $htmlDom = document.documentElement.classList
      $htmlDom.contains('hide-aside')
        ? saveToLocal.set('aside-status', 'show', 2)
        : saveToLocal.set('aside-status', 'hide', 2)
      $htmlDom.toggle('hide-aside')
    },

    runMobileToc: () => {
      if (window.getComputedStyle(document.getElementById('card-toc')).getPropertyValue('opacity') === '0') window.mobileToc.open()
      else window.mobileToc.close()
    }
  }

  document.getElementById('rightside').addEventListener('click', function (e) {
    const $target = e.target.id ? e.target : e.target.parentNode
    switch ($target.id) {
      case 'go-up':
        rightSideFn.scrollToTop()
        break
      case 'rightside_config':
        rightSideFn.showOrHideBtn($target)
        break
      case 'mobile-toc-button':
        rightSideFn.runMobileToc()
        break
      case 'readmode':
        rightSideFn.switchReadMode()
        break
      case 'darkmode':
        rightSideFn.switchDarkMode()
        break
      case 'hide-aside-btn':
        rightSideFn.hideAsideBtn()
        break
      default:
        break
    }
  })

  
  const clickFnOfSubMenu = () => {
    document.querySelectorAll('#sidebar-menus .site-page.group').forEach(function (item) {
      item.addEventListener('click', function () {
        this.classList.toggle('hide')
      })
    })
  }

  
  const addCopyright = () => {
    const copyright = GLOBAL_CONFIG.copyright
    document.body.oncopy = (e) => {
      e.preventDefault()
      let textFont; const copyFont = window.getSelection(0).toString()
      if (copyFont.length > copyright.limitCount) {
        textFont = copyFont + '\n' + '\n' + '\n' +
        copyright.languages.author + '\n' +
        copyright.languages.link + window.location.href + '\n' +
        copyright.languages.source + '\n' +
        copyright.languages.info
      } else {
        textFont = copyFont
      }
      if (e.clipboardData) {
        return e.clipboardData.setData('text', textFont)
      } else {
        return window.clipboardData.setData('text', textFont)
      }
    }
  }

  
  const addRuntime = () => {
    const $runtimeCount = document.getElementById('runtimeshow')
    if ($runtimeCount) {
      const publishDate = $runtimeCount.getAttribute('data-publishDate')
      $runtimeCount.innerText = btf.diffDate(publishDate) + ' ' + GLOBAL_CONFIG.runtime
    }
  }

  
  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById('last-push-date')
    if ($lastPushDateItem) {
      const lastPushDate = $lastPushDateItem.getAttribute('data-lastPushDate')
      $lastPushDateItem.innerText = btf.diffDate(lastPushDate, true)
    }
  }

  
  const addTableWrap = () => {
    const $table = document.querySelectorAll('#article-container :not(.highlight) > table, #article-container > table')
    if ($table.length) {
      $table.forEach(item => {
        btf.wrap(item, 'div', { class: 'table-wrap' })
      })
    }
  }

  
  const clickFnOfTagHide = function () {
    const $hideInline = document.querySelectorAll('#article-container .hide-button')
    if ($hideInline.length) {
      $hideInline.forEach(function (item) {
        item.addEventListener('click', function (e) {
          const $this = this
          $this.classList.add('open')
          const $fjGallery = $this.nextElementSibling.querySelectorAll('.fj-gallery')
          $fjGallery.length && btf.initJustifiedGallery($fjGallery)
        })
      })
    }
  }

  const tabsFn = {
    clickFnOfTabs: function () {
      document.querySelectorAll('#article-container .tab > button').forEach(function (item) {
        item.addEventListener('click', function (e) {
          const $this = this
          const $tabItem = $this.parentNode

          if (!$tabItem.classList.contains('active')) {
            const $tabContent = $tabItem.parentNode.nextElementSibling
            const $siblings = btf.siblings($tabItem, '.active')[0]
            $siblings && $siblings.classList.remove('active')
            $tabItem.classList.add('active')
            const tabId = $this.getAttribute('data-href').replace('#', '')
            const childList = [...$tabContent.children]
            childList.forEach(item => {
              if (item.id === tabId) item.classList.add('active')
              else item.classList.remove('active')
            })
            const $isTabJustifiedGallery = $tabContent.querySelectorAll(`#${tabId} .fj-gallery`)
            if ($isTabJustifiedGallery.length > 0) {
              btf.initJustifiedGallery($isTabJustifiedGallery)
            }
          }
        })
      })
    },
    backToTop: () => {
      document.querySelectorAll('#article-container .tabs .tab-to-top').forEach(function (item) {
        item.addEventListener('click', function () {
          btf.scrollToDest(btf.getEleTop(btf.getParents(this, '.tabs')), 300)
        })
      })
    }
  }

  const toggleCardCategory = function () {
    const $cardCategory = document.querySelectorAll('#aside-cat-list .card-category-list-item.parent i')
    if ($cardCategory.length) {
      $cardCategory.forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.preventDefault()
          const $this = this
          $this.classList.toggle('expand')
          const $parentEle = $this.parentNode.nextElementSibling
          if (btf.isHidden($parentEle)) {
            $parentEle.style.display = 'block'
          } else {
            $parentEle.style.display = 'none'
          }
        })
      })
    }
  }

  const switchComments = function () {
    let switchDone = false
    const $switchBtn = document.querySelector('#comment-switch > .switch-btn')
    $switchBtn && $switchBtn.addEventListener('click', function () {
      this.classList.toggle('move')
      document.querySelectorAll('#post-comment > .comment-wrap > div').forEach(function (item) {
        if (btf.isHidden(item)) {
          item.style.cssText = 'display: block;animation: tabshow .5s'
        } else {
          item.style.cssText = "display: none;animation: ''"
        }
      })

      if (!switchDone && typeof loadOtherComment === 'function') {
        switchDone = true
        loadOtherComment()
      }
    })
  }

  const addPostOutdateNotice = function () {
    const data = GLOBAL_CONFIG.noticeOutdate
    const diffDay = btf.diffDate(GLOBAL_CONFIG_SITE.postUpdate)
    if (diffDay >= data.limitDay) {
      const ele = document.createElement('div')
      ele.className = 'post-outdate-notice'
      ele.textContent = data.messagePrev + ' ' + diffDay + ' ' + data.messageNext
      const $targetEle = document.getElementById('article-container')
      if (data.position === 'top') {
        $targetEle.insertBefore(ele, $targetEle.firstChild)
      } else {
        $targetEle.appendChild(ele)
      }
    }
  }

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: 'img',
      threshold: 0,
      data_src: 'lazy-src'
    })
  }

  const relativeDate = function (selector) {
    selector.forEach(item => {
      const $this = item
      const timeVal = $this.getAttribute('datetime')
      $this.innerText = btf.diffDate(timeVal, true)
      $this.style.display = 'inline'
    })
  }

  const unRefreshFn = function () {
    window.addEventListener('resize', () => {
      adjustMenu(false)
      btf.isHidden(document.getElementById('toggle-menu')) && mobileSidebarOpen && sidebarFn.close()
    })

    document.getElementById('menu-mask').addEventListener('click', e => { sidebarFn.close() })

    clickFnOfSubMenu()
    GLOBAL_CONFIG.islazyload && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright()
  }

  window.refreshFn = function () {
    initAdjust()

    if (GLOBAL_CONFIG_SITE.isPost) {
      GLOBAL_CONFIG.noticeOutdate !== undefined && addPostOutdateNotice()
      GLOBAL_CONFIG.relativeDate.post && relativeDate(document.querySelectorAll('#post-meta time'))
    } else {
      GLOBAL_CONFIG.relativeDate.homepage && relativeDate(document.querySelectorAll('#recent-posts time'))
      GLOBAL_CONFIG.runtime && addRuntime()
      addLastPushDate()
      toggleCardCategory()
    }

    scrollFnToDo()
    GLOBAL_CONFIG_SITE.isHome && scrollDownInIndex()
    addHighlightTool()
    GLOBAL_CONFIG.isPhotoFigcaption && addPhotoFigcaption()
    scrollFn()

    const $jgEle = document.querySelectorAll('#article-container .fj-gallery')
    $jgEle.length && runJustifiedGallery($jgEle)

    runLightbox()
    addTableWrap()
    clickFnOfTagHide()
    tabsFn.clickFnOfTabs()
    tabsFn.backToTop()
    switchComments()
    document.getElementById('toggle-menu').addEventListener('click', () => { sidebarFn.open() })
  }

  refreshFn()
  unRefreshFn()
})