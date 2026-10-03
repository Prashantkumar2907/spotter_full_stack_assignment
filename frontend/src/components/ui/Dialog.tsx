import { Drawer, Modal } from '@mantine/core'
import type { ReactNode } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import styles from './Dialog.module.css'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  footer?: ReactNode
  size?: 'full' | 'form' | 'drawer'
  children: ReactNode
}

const FORM_WIDTH = 520
const FULL_WIDTH = 'min(1200px, calc(100vw - 32px))'
const DRAWER_WIDTH = 480
const PHONE_QUERY = '(max-width: 640px)'
const OVERLAY_OPACITY = 0.45
const OVERLAY_BLUR = 3
const PART_CLASSES = { content: styles.content, header: styles.header, title: styles.title, body: styles.body }

type Parts = typeof Modal | typeof Drawer

function DialogFrame({ parts: P, title, description, footer, children }: Omit<DialogProps, 'open' | 'onClose' | 'size'> & { parts: Parts }) {
  return (
    <>
      <P.Overlay backgroundOpacity={OVERLAY_OPACITY} blur={OVERLAY_BLUR} />
      <P.Content>
        <P.Header>
          <div className={styles.heading}>
            <P.Title>{title}</P.Title>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <P.CloseButton aria-label="Close" radius="xl" size="lg" />
        </P.Header>
        <P.Body>{children}</P.Body>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </P.Content>
    </>
  )
}

export function Dialog({ open, onClose, size = 'full', ...frame }: DialogProps) {
  const phone = useMediaQuery(PHONE_QUERY)
  if (size === 'drawer') {
    return (
      <Drawer.Root opened={open} onClose={onClose} position={phone ? 'bottom' : 'right'} size={phone ? 'auto' : DRAWER_WIDTH} className={styles.drawer} classNames={PART_CLASSES}>
        <DialogFrame parts={Drawer} {...frame} />
      </Drawer.Root>
    )
  }
  return (
    <Modal.Root opened={open} onClose={onClose} size={size === 'form' ? FORM_WIDTH : FULL_WIDTH} centered fullScreen={phone} className={styles[size]} classNames={PART_CLASSES}>
      <DialogFrame parts={Modal} {...frame} />
    </Modal.Root>
  )
}
