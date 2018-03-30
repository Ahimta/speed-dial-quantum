// @ts-check
import importSpeedDial from './_import_speed_dial'
import * as repos from './_repos'

export default async function render (selectedGroupId) {
  const [groups, thumbnails] = await Promise.all([
    repos.group.list(),
    repos.thumnail.list()
  ])

  const x = thumbnailsElements(thumbnails, selectedGroupId)
  const y = tabElement(groups, x, selectedGroupId)

  const root = document.getElementById('root')
  while (root.firstChild) {
    root.removeChild(root.firstChild)
  }
  root.appendChild(y)
}

function tabElement (groups, thumbnailsElements, selectedGroupId) {
  const tab = createElement('section', { className: 'card text-center' })
  const header = createElement('header', {
    className: 'card-header',
    children: [
      createElement('ul', {
        className: 'nav nav-tabs card-header-tabs',
        children: groups
          .map(group =>
            createElement('li', {
              className: 'nav-item',
              onClick: () => {
                render(group.id)
              },
              children: [
                createElement('a', {
                  className:
                    group.id === selectedGroupId
                      ? 'nav-link active'
                      : 'nav-link',
                  href: '#',
                  innerText: group.name
                })
              ]
            })
          )
          .concat(
            createElement('li', {
              className: 'nav-item',
              onClick: async () => {
                const name = window.prompt('New Group Name')

                if (!name) {
                  return
                }

                await repos.group.add({ name })
                render(selectedGroupId)
              },
              children: [
                createElement('a', {
                  className: 'nav-link',
                  href: '#',
                  innerText: 'Add Group'
                })
              ]
            })
          )
      })
    ]
  })

  const cardBody = createElement('div', {
    className: 'card-body',
    children: thumbnailsElements
  })

  const speedDialFile = createElement('input', {
    type: 'file',
    style: { display: 'none' },
    onChange: async event => {
      const file = event.target.files[0]
      const { groups, thumbnails } = await importSpeedDial(file)

      await repos.group.replace(groups)
      await repos.thumnail.replace(thumbnails)
      render(groups[0].id)
    }
  })

  const cardFooter = createElement('footer', {
    className: 'card-footer',
    children: [
      createElement('button', {
        className: 'btn btn-block btn-success',
        innerText: 'Import Speed Dial',
        type: 'button',
        onClick: () => {
          speedDialFile.click()
        }
      })
    ]
  })

  tab.appendChild(header)
  tab.appendChild(cardBody)
  tab.appendChild(cardFooter)
  return tab
}

function thumbnailsElements (thumbnails, selectedGroupId) {
  const elements = thumbnails
    .map(({ groupId, id, url, title, imgUrl }, i) => {
      if (groupId !== selectedGroupId) {
        return null
      }

      const card = createElement('article', {
        className: 'card',
        children: [
          createElement('a', {
            href: url || '#',
            children: [
              createElement('img', {
                alt: `${i + 1}`,
                className: 'card-img-top',
                height: 150,
                src:
                  imgUrl || `https://via.placeholder.com/350x150?text=${i + 1}`,
                width: 350,
                onDrop: async event => {
                  event.preventDefault()

                  if (!event.dataTransfer.items) {
                    return
                  }

                  const img = event.dataTransfer.items[0].getAsFile()

                  // @ts-ignore
                  const reader = new window.FileReader()
                  reader.readAsDataURL(img)
                  const newImgUrl = await (() =>
                    new Promise(resolve => {
                      reader.onload = () => resolve(reader.result)
                    }))()

                  await repos.thumnail.update(id, { imgUrl: newImgUrl })
                  render(selectedGroupId)
                }
              })
            ]
          })
        ]
      })

      const cardBody = createElement('div', {
        className: 'card-body',
        children: [
          createElement('h5', {
            className: 'card-title',
            innerText: `(${i + 1})`
          }),
          createElement('p', {
            className: 'card-text',
            innerText: title || '(No Title -_-)'
          })
        ]
      })
      const cardFooter = createElement('footer', {
        className: 'card-footer',
        children: [
          createElement('div', {
            className: 'btn-group',
            role: 'group',
            children: [
              createElement('button', {
                className: 'btn btn-primary',
                innerText: 'T',
                type: 'button',
                onClick: async () => {
                  const newTitle = window.prompt('New Title')

                  if (!newTitle) {
                    return
                  }

                  await repos.thumnail.update(id, { title: newTitle })
                  render(selectedGroupId)
                }
              }),
              createElement('button', {
                className: 'btn btn-primary',
                innerText: 'U',
                type: 'button',
                onClick: async () => {
                  const newUrl = window.prompt('New URL')

                  if (!newUrl) {
                    return
                  }

                  await repos.thumnail.update(id, { url: newUrl })
                  render(selectedGroupId)
                }
              }),
              createElement('button', {
                className: 'btn btn-danger',
                innerText: 'D',
                type: 'button',
                onClick: async () => {
                  await repos.thumnail.remove(id)
                  render(selectedGroupId)
                }
              })
            ]
          })
        ]
      })

      card.appendChild(cardBody)
      card.appendChild(cardFooter)
      return card
    })
    .filter(x => x)

  const cardGroups = []
  for (let i = 0; i < elements.length; i = i + 3) {
    const cardGroup = document.createElement('div')
    cardGroup.className = 'card-group'
    cardGroup.style.marginBottom = '1em'

    for (let j = i; j < elements.length; j++) {
      cardGroup.appendChild(elements[j])
    }

    cardGroups.push(cardGroup)
  }

  const addThumbnailBtn = document.createElement('button')
  addThumbnailBtn.type = 'button'
  addThumbnailBtn.className = 'btn btn-block btn-primary'
  addThumbnailBtn.innerText = 'Add Thumbnail'
  addThumbnailBtn.addEventListener('click', async () => {
    const url = window.prompt('New URL')
    if (!url) {
      return
    }

    await repos.thumnail.add({ url, groupId: selectedGroupId })
    render(selectedGroupId)
  })

  cardGroups.push(addThumbnailBtn)
  return cardGroups
}

function createElement (
  name,
  {
    alt = null,
    className = null,
    disabled = null,
    height = null,
    href = null,
    innerText = null,
    role = null,
    src = null,
    type = null,
    width = null,
    style = null,
    children = [],
    onChange = null,
    onClick = null,
    onDrop = null
  } = {}
) {
  const element = document.createElement(name)

  if (alt) {
    element.alt = alt
  }
  if (className) {
    element.className = className
  }
  if (disabled) {
    element.disabled = disabled
  }
  if (height) {
    element.height = height
  }
  if (href) {
    element.href = href
  }
  if (innerText) {
    element.innerText = innerText
  }
  if (role) {
    element.role = role
  }
  if (src) {
    element.src = src
  }
  if (type) {
    element.type = type
  }
  if (width) {
    element.width = width
  }

  if (children.length) {
    children.forEach(child => element.appendChild(child))
  }

  if (style) {
    Object.keys(style).forEach(styleAttr => {
      element[styleAttr] = style[styleAttr]
    })
  }

  if (onChange) {
    element.addEventListener('change', onChange)
  }
  if (onClick) {
    element.addEventListener('click', onClick)
  }
  if (onDrop) {
    element.addEventListener('dragover', event => {
      event.preventDefault()
    })
    element.addEventListener('drop', onDrop)
  }

  return element
}