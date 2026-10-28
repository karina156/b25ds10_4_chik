// скрипты для всех страниц сайта

const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

headerScroll()
burgerMenu()
modals()
ticketForm()
cart()
artists()
lightbox()
processMap()
programCarousel()
reveal()
birdNotes()
backButton()

/* ШАПКА */

// когда страницу прокрутили, у шапки появляется фон
function headerScroll() {
  const header = document.querySelector('.header')

  if (!header) return

  const check = () => {
    header.classList.toggle('scrolled', window.scrollY > 20)
  }

  window.addEventListener('scroll', check, { passive: true })
  check()
}

/* МЕНЮ НА ТЕЛЕФОНЕ */

function burgerMenu() {
  const burger = document.querySelector('.burger')
  const menu = document.querySelector('.menu')

  if (!burger || !menu) return

  const toggle = (open) => {
    menu.classList.toggle('open', open)
    burger.setAttribute('aria-expanded', open)
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
    document.body.classList.toggle('lock', open)
  }

  burger.addEventListener('click', () => {
    toggle(!menu.classList.contains('open'))
  })

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggle(false))
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      toggle(false)
      burger.focus()
    }
  })

  // если экран стал широким, меню закрываем
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1023 && menu.classList.contains('open')) {
      toggle(false)
    }
  })
}

/* МОДАЛЬНЫЕ ОКНА */

let lastFocus = null

function openModal(modal) {
  lastFocus = document.activeElement
  modal.hidden = false
  document.body.classList.add('lock')

  // сначала показываем блок, потом запускаем анимацию
  requestAnimationFrame(() => {
    modal.classList.add('open')
    const first = modal.querySelector('input, select, button:not(.modal-close)') || modal.querySelector('button')
    if (first) first.focus()
  })
}

function closeModal(modal) {
  modal.classList.remove('open')
  document.body.classList.remove('lock')

  setTimeout(() => {
    modal.hidden = true
    modal.dispatchEvent(new Event('closed'))
  }, noMotion ? 0 : 300)

  if (lastFocus) lastFocus.focus()
}

function modals() {
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]')

    if (opener) {
      const modal = document.getElementById(opener.dataset.open)
      if (!modal) return

      // если окно уже открыто (например, из окна артиста открыли билеты)
      document.querySelectorAll('.modal.open').forEach((other) => {
        if (other !== modal) {
          other.classList.remove('open')
          other.hidden = true
        }
      })

      modal.dispatchEvent(new CustomEvent('opening', { detail: opener }))
      openModal(modal)
      return
    }

    const closer = e.target.closest('[data-close]')
    if (closer) {
      closeModal(closer.closest('.modal'))
      return
    }

    // клик по темному фону вокруг окна
    if (e.target.classList.contains('modal')) {
      closeModal(e.target)
    }
  })

  document.addEventListener('keydown', (e) => {
    const modal = document.querySelector('.modal.open')
    if (!modal) return

    if (e.key === 'Escape') {
      closeModal(modal)
    }

    // фокус не уходит из окна
    if (e.key === 'Tab') {
      const items = [...modal.querySelectorAll('a, button, input, select')].filter((el) => el.offsetParent !== null)
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })
}

/* ПОКУПКА БИЛЕТА */

function ticketForm() {
  const modal = document.getElementById('ticket')

  if (!modal) return

  const form = modal.querySelector('.ticket-form')
  const phone = form.phone
  const successText = modal.querySelector('.success-text')

  // если нажали «Выбрать» на карточке, билет уже выбран
  modal.addEventListener('opening', (e) => {
    const ticket = e.detail.dataset.ticket
    if (ticket) form.ticket.value = ticket
  })

  // после закрытия возвращаем форму
  modal.addEventListener('closed', () => {
    if (modal.classList.contains('done')) {
      modal.classList.remove('done')
      form.reset()
    }
  })

  phone.addEventListener('input', () => {
    phone.value = phoneMask(phone.value)
  })

  form.querySelectorAll('input, select').forEach((field) => {
    field.addEventListener('input', () => {
      field.closest('.field').classList.remove('error')
    })
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const checks = {
      name: form.name.value.trim().length >= 2,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()),
      phone: phone.value.replace(/\D/g, '').length === 11,
      ticket: form.ticket.value !== '',
    }

    let firstError = null

    Object.keys(checks).forEach((key) => {
      const field = form[key].closest('.field')
      field.classList.toggle('error', !checks[key])
      if (!checks[key] && !firstError) firstError = form[key]
    })

    if (firstError) {
      firstError.focus()
      return
    }

    successText.textContent =
      `Спасибо, ${form.name.value.trim()}! Заявка на билет «${form.ticket.value}» принята. ` +
      `Мы пришлём его на ${form.email.value.trim()}.`

    modal.classList.add('done')
    modal.querySelector('.success .btn').focus()
  })
}

// +7 (900) 123-45-67
function phoneMask(value) {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (!digits.startsWith('7')) digits = '7' + digits
  digits = digits.slice(0, 11)

  let result = '+7'
  if (digits.length > 1) result += ' (' + digits.slice(1, 4)
  if (digits.length >= 4) result += ')'
  if (digits.length > 4) result += ' ' + digits.slice(4, 7)
  if (digits.length > 7) result += '-' + digits.slice(7, 9)
  if (digits.length > 9) result += '-' + digits.slice(9, 11)

  return result
}

/* КОРЗИНА */

function cart() {
  const modal = document.getElementById('cart')

  if (!modal) return

  const list = modal.querySelector('.cart-list')
  const empty = modal.querySelector('.cart-empty')
  const total = modal.querySelector('.cart-total')
  const sum = modal.querySelector('.cart-sum')
  const orderBtn = modal.querySelector('.cart-order')
  const counter = document.querySelector('.cart-count')
  let items = loadCart()

  const save = () => {
    try {
      localStorage.setItem('chik-cart', JSON.stringify(items))
    } catch (error) {
      // в приватном режиме сохранить не получится, корзина просто живет до перезагрузки
    }
  }

  const render = () => {
    const count = items.reduce((all, item) => all + item.qty, 0)
    const price = items.reduce((all, item) => all + item.qty * item.price, 0)

    counter.textContent = count
    counter.classList.toggle('visible', count > 0)

    empty.hidden = items.length > 0
    total.hidden = items.length === 0
    orderBtn.hidden = items.length === 0
    sum.textContent = formatPrice(price)

    list.innerHTML = ''
    items.forEach((item) => {
      const li = document.createElement('li')
      li.className = 'cart-item'
      li.innerHTML = `
        <img src="${item.img}" alt="" width="80" height="80" />
        <div>
          <p class="cart-item-name"></p>
          <p class="cart-item-price">${formatPrice(item.price)}</p>
        </div>
        <div class="cart-qty">
          <button type="button" data-minus="${item.id}" aria-label="Убрать одну штуку">−</button>
          <span>${item.qty}</span>
          <button type="button" data-plus="${item.id}" aria-label="Добавить ещё одну">+</button>
        </div>
      `
      li.querySelector('.cart-item-name').textContent = item.name
      list.appendChild(li)
    })

    // отмечаем товары, которые уже лежат в корзине
    document.querySelectorAll('.product-add').forEach((btn) => {
      btn.classList.toggle('added', items.some((item) => item.id === btn.dataset.id))
    })
  }

  document.querySelectorAll('.product-add').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = items.find((one) => one.id === btn.dataset.id)

      if (item) {
        item.qty++
      } else {
        items.push({
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: Number(btn.dataset.price),
          img: btn.dataset.img,
          qty: 1,
        })
      }

      save()
      render()
      showToast(`Добавлено в корзину: ${btn.dataset.name}`)
    })
  })

  list.addEventListener('click', (e) => {
    const plus = e.target.closest('[data-plus]')
    const minus = e.target.closest('[data-minus]')

    if (plus) {
      items.find((item) => item.id === plus.dataset.plus).qty++
    }

    if (minus) {
      const item = items.find((one) => one.id === minus.dataset.minus)
      item.qty--
      if (item.qty === 0) items = items.filter((one) => one !== item)
    }

    save()
    render()
  })

  orderBtn.addEventListener('click', () => {
    items = []
    save()
    render()
    modal.classList.add('done')
    modal.querySelector('.success .btn').focus()
  })

  modal.addEventListener('closed', () => {
    modal.classList.remove('done')
  })

  render()
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('chik-cart')) || []
  } catch (error) {
    return []
  }
}

function formatPrice(number) {
  return number.toLocaleString('ru-RU') + ' ₽'
}

let toastTimer = null

function showToast(text) {
  const toast = document.querySelector('.toast')

  if (!toast) return

  toast.textContent = text
  toast.classList.add('show')

  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200)
}

/* АРТИСТЫ */

function artists() {
  const modal = document.getElementById('artist')
  const cards = document.querySelectorAll('.artist')

  if (!modal || !cards.length) return

  const photo = modal.querySelector('.artist-modal-photo')

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      photo.src = card.dataset.img
      photo.alt = card.dataset.name
      modal.querySelector('.modal-title').textContent = card.dataset.name
      modal.querySelector('.artist-genre').textContent = card.dataset.genre
      modal.querySelector('.artist-bio').textContent = card.dataset.bio
      openModal(modal)
    })
  })
}

/* ПРОСМОТР КАРТИНОК */

function lightbox() {
  const modal = document.getElementById('lightbox')
  const links = document.querySelectorAll('[data-lightbox]')

  if (!modal || !links.length) return

  const image = modal.querySelector('.lightbox-image')
  const prev = modal.querySelector('.lightbox-prev')
  const next = modal.querySelector('.lightbox-next')
  let group = []
  let index = 0

  const show = () => {
    const link = group[index]
    image.src = link.dataset.src
    image.alt = link.querySelector('img').alt
  }

  const move = (step) => {
    index = (index + step + group.length) % group.length
    show()
  }

  links.forEach((link) => {
    link.addEventListener('click', () => {
      group = [...document.querySelectorAll(`[data-lightbox="${link.dataset.lightbox}"]`)]
      index = group.indexOf(link)
      prev.hidden = group.length < 2
      next.hidden = group.length < 2
      show()
      openModal(modal)
    })
  })

  prev.addEventListener('click', () => move(-1))
  next.addEventListener('click', () => move(1))

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open') || group.length < 2) return
    if (e.key === 'ArrowLeft') move(-1)
    if (e.key === 'ArrowRight') move(1)
  })
}

/* КАРТА: ШАГИ */

function processMap() {
  const buttons = document.querySelectorAll('.process-step-btn')
  const parts = document.querySelectorAll('.process-part')
  const bar = document.querySelector('.process-steps')

  if (!buttons.length || !parts.length) return

  const setActive = (key) => {
    buttons.forEach((btn) => {
      const active = btn.dataset.step === key
      btn.classList.toggle('active', active)

      // на телефоне лента сама прокручивается к активной кнопке
      if (active && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: btn.offsetLeft - bar.offsetLeft - 20, behavior: noMotion ? 'auto' : 'smooth' })
      }
    })
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.step).scrollIntoView({ behavior: noMotion ? 'auto' : 'smooth' })
    })
  })

  // активный шаг тот, что сейчас в середине экрана
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id)
    })
  }, { rootMargin: '-45% 0px -50% 0px' })

  parts.forEach((part) => observer.observe(part))
}

/* ПРОГРАММА: КАРУСЕЛЬ АФИШ */

function programCarousel() {
  const stage = document.querySelector('.program-stage')

  if (!stage) return

  const posters = [...stage.querySelectorAll('.poster')]
  const gridButtons = document.querySelectorAll('.program-grid button')
  const name = document.querySelector('.program-now .program-name')
  const time = document.querySelector('.program-now .program-time')
  const half = Math.floor(posters.length / 2)
  let current = 0

  const place = () => {
    posters.forEach((poster, i) => {
      // насколько афиша далеко от центральной, по кругу
      let offset = i - current
      if (offset > half) offset -= posters.length
      if (offset < -half) offset += posters.length
      const depth = Math.abs(offset)

      poster.style.setProperty('--offset', offset)
      poster.style.setProperty('--depth', depth)
      poster.style.zIndex = 10 - depth
      poster.style.opacity = depth > 2 ? 0 : 1
      poster.classList.toggle('active', offset === 0)
      poster.tabIndex = depth > 1 ? -1 : 0
    })

    name.textContent = posters[current].dataset.name
    time.textContent = posters[current].dataset.time
  }

  const move = (step) => {
    current = (current + step + posters.length) % posters.length
    place()
  }

  posters.forEach((poster, i) => {
    poster.addEventListener('click', () => {
      if (i === current) {
        // центральную афишу открываем крупно
        gridButtons[i].click()
      } else {
        current = i
        place()
      }
    })
  })

  document.querySelector('.program-prev').addEventListener('click', () => move(-1))
  document.querySelector('.program-next').addEventListener('click', () => move(1))

  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') move(-1)
    if (e.key === 'ArrowRight') move(1)
  })

  // листание пальцем
  let startX = null

  stage.addEventListener('pointerdown', (e) => {
    startX = e.clientX
  })

  stage.addEventListener('pointerup', (e) => {
    if (startX === null) return
    const diff = e.clientX - startX
    if (Math.abs(diff) > 40) move(diff < 0 ? 1 : -1)
    startX = null
  })

  place()
}

/* ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ */

function reveal() {
  if (noMotion || !('IntersectionObserver' in window)) return

  const blocks = document.querySelectorAll(
    '.ticket, .manifest, .faq-item, .next-card, .party-text, .about-intro, .zine, .program-grid button, ' +
      '.artist, .map-hero, .process-part, .product, .poster-head, .poster-card',
  )

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('shown')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })

  blocks.forEach((block) => {
    // соседние карточки появляются по очереди
    const siblings = [...block.parentElement.children]
    const order = siblings.indexOf(block) % 4
    block.style.transitionDelay = order * 0.08 + 's'

    block.classList.add('reveal')
    observer.observe(block)
  })
}

/* НОТКИ ИЗ ПТИЧЕК */

function birdNotes() {
  const birds = document.querySelectorAll('.bird-click')
  const notes = ['note-1', 'note-2', 'note-5', 'note-6', 'note-7']

  if (!birds.length || noMotion) return

  birds.forEach((bird) => {
    bird.addEventListener('click', (e) => {
      for (let i = 0; i < 7; i++) {
        const note = document.createElement('img')
        note.src = `./images/${notes[i % notes.length]}.svg`
        note.className = 'fly-note'
        note.alt = ''
        note.style.left = e.clientX + 'px'
        note.style.top = e.clientY + 'px'
        note.style.setProperty('--x', Math.random() * 16 - 8 + 'vw')
        note.style.setProperty('--y', -6 - Math.random() * 10 + 'vw')
        note.style.setProperty('--r', Math.random() * 120 - 60 + 'deg')
        note.style.animationDelay = i * 0.04 + 's'
        note.addEventListener('animationend', () => note.remove())
        document.body.appendChild(note)
      }
    })
  })
}

/* 404 */

function backButton() {
  const btn = document.querySelector('[data-back]')

  if (!btn) return

  btn.addEventListener('click', () => {
    if (history.length > 1) {
      history.back()
    } else {
      window.location.href = 'index.html'
    }
  })
}
