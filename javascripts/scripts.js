// скрипты для всех страниц сайта

burgerMenu()
submitForm()
input()
processMap()

function burgerMenu() {
  const burger = document.querySelector('.burger')
  const menu = document.querySelector('.menu')
  const closeBtn = document.querySelector('.close-menu')

  if (!burger || !menu || !closeBtn) return

  burger.addEventListener('click', () => {
    menu.classList.add('active')
    burger.classList.add('hide')
  })

  closeBtn.addEventListener('click', () => {
    menu.classList.remove('active')
    burger.classList.remove('hide')
  })
}

function submitForm() {
  const form = document.querySelector('form')
  const modalWindow = document.querySelector('.modalWindow')
  const windowBlock = document.querySelector('.window')

  if (!form || !modalWindow || !windowBlock) return

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const userName = form.userName.value
    const message = `Спасибо, ${userName}, данные записаны.`

    windowBlock.innerHTML = message
    modalWindow.style.display = 'flex'
  })

  modalWindow.addEventListener('click', () => {
    modalWindow.style.display = 'none'
  })
}

function input() {
  const phoneInput = document.querySelector('input[type="tel"]')

  if (!phoneInput) return
}

function processMap() {
  const content = document.querySelector('.process-content')
  const steps = document.querySelectorAll('.process-step')
  const cards = document.querySelectorAll('.process-card')

  if (!content || !steps.length || !cards.length) return

  function changeProcessCard() {
    const contentRect = content.getBoundingClientRect()
    const center = contentRect.top + contentRect.height / 2

    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect()

      if (rect.top < center && rect.bottom > center) {
        cards.forEach((card) => card.classList.remove('active'))

        if (cards[index]) {
          cards[index].classList.add('active')
        }
      }
    })
  }

  content.addEventListener('scroll', changeProcessCard)
  changeProcessCard()
}

function ticketModal() {
  const modal = document.querySelector('.ticket-modal')
  const openBtns = document.querySelectorAll('.open-ticket-modal')
  const closeBtn = document.querySelector('.ticket-modal-close')

  if (!modal || !closeBtn || !openBtns.length) return

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      modal.classList.add('active')
    })
  })

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active')
  })

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active')
    }
  })
}

ticketModal()